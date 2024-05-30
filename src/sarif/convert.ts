import * as ghCore from '@actions/core';
import * as sarif from "sarif";
import * as fs from "fs";

import * as result from './results.js';
import * as types from './types.js';
import { SARIF_SCHEMA_URL, SARIF_SCHEMA_VERSION, MAVEN, GRADLE, fileNameToEcosystemMappings } from '../constants.js';
import { isDefined } from '../utils.js'
import path from 'path';

export function resolveDependencyFromReference(ref: string): string {
    return ref.replace(`pkg:${resolveEcosystemFromReference(ref)}/`, '').split('?')[0];
}

export function resolveEcosystemFromReference(ref: string): string {
    const match = ref.match(/pkg:(.*?)\//);

    if (match && match[1]) {
        return match[1];
    }

    return undefined
};

export function resolveVersionFromReference(ref: string): string {
    const resolvedRef = resolveDependencyFromReference(ref);
    return resolvedRef.split('@')[1] || '';
}

function getManifestData(filepath: string, ecosystem: string): string {

    const manifestData = fs.readFileSync(filepath, "utf-8");

    const args: Map<string, string> = new Map<string, string>();

    const replaceArgsInString = (str: string): string => {
        args.forEach((value, key) => {
            const regexWithBraces = new RegExp(`\\$\\{${key}\\}`, 'g');
            const regexWithoutBraces = new RegExp(`\\$${key}\\b`, 'g');
    
            str = str.replace(regexWithBraces, value).replace(regexWithoutBraces, value);
        });
        return str;
    }

    if (ecosystem === GRADLE) {

        const lines = manifestData.split(/\r\n|\n/);

        let isSingleArgument: boolean = false;
        let isArgumentBlock: boolean = false;
        lines.forEach(line => {
            const cleanLine = line.split('//')[0].replace(/\/\*[\s\S]*?\*\//g, '').trim(); // Remove comments

            if (isSingleArgument) {
                if (cleanLine.startsWith('{')) {
                    isArgumentBlock = true;
                }
                isSingleArgument = false;
            }

            if (cleanLine.includes('ext')) {               
                if (cleanLine.includes('{')) {
                    isArgumentBlock = true;
                } else {
                    isSingleArgument = true;
                }
            }

            if (isSingleArgument || isArgumentBlock) {
                if (cleanLine.includes('}')) {
                    isArgumentBlock = false;
                }

                const argDataMatch = cleanLine.match(/\b(\w+)\s*=\s*(['"])(.*?)\2/);
                if (argDataMatch) {
                    args.set(argDataMatch[1].trim(), argDataMatch[3].trim());
                }
            }          
        });
        
        return replaceArgsInString(manifestData);
    }

    return manifestData;
}

function rhdaJsonToSarif(rhdaData: any, manifestFilePath: string): { sarifObject: any, VulnerabilitySeverity: string } {
    /*
    * creates results and rules and structures SARIF
    */

    let finalResults: sarif.Result[] = [];
    let finalRules: sarif.ReportingDescriptor[] = [];
    const dependencies: Map<string, types.IDependencyData[]> = new Map<string, types.IDependencyData[]>()
    const failedProviders: string[] = [];
    const sources: types.ISource[] = [];
    let vulSeverity: types.VulnerabilitySeverity = "none";

    let ecosystem = fileNameToEcosystemMappings[path.basename(manifestFilePath)];    
    const manifestData = getManifestData(manifestFilePath, ecosystem);
    const lines = manifestData.split(/\r\n|\n/);

    const getRecommendation = (dependency: any): string => {
        return isDefined(dependency, 'recommendation') ? resolveVersionFromReference(dependency.recommendation) : '';
    }

    const getSummary = (sourceData: any): types.ISummary => {
        return isDefined(sourceData, 'summary') ? sourceData.summary : null;
    }

    const getDependencies = (sourceData: any): any[] => {
        return isDefined(sourceData, 'dependencies') ? sourceData.dependencies : [];
    }

    const updateVulnerabilitySeverity = (summary: types.ISummary): void => {
        if ( summary.critical > 0 || summary.high > 0) {
            vulSeverity = 'error';
        } else if ( vulSeverity != 'error' && (summary.medium > 0 || summary.low > 0)) {
            vulSeverity = 'warning';
        }
    }

    const getDependencyData = (d: any, source: types.ISource): types.IDependencyData => {
        if (isDefined(d, 'ref')) {

            const issues: types.IIssue[] = isDefined(d, 'issues') ? d.issues : null;
            const transitives: types.IDependencyData[] = isDefined(d, 'transitive') ? d.transitive.map(t => getDependencyData(t, source)) : null;

            let dependencyGroup = null;
            let dependencyName = resolveDependencyFromReference(d.ref).split('@')[0];
            let dependencyVersion = resolveVersionFromReference(d.ref);
            if (ecosystem === MAVEN || ecosystem === GRADLE) {
                dependencyGroup = dependencyName.split('/')[0];
                dependencyName = dependencyName.split('/')[1];
            }

            return {
                ref: d.ref,
                depGroup: dependencyGroup,
                depName: dependencyName,
                depVersion: dependencyVersion,
                ecosystem: ecosystem,
                providerId: source.providerId,
                sourceId: source.sourceId,
                issues: issues,
                transitives: transitives,
                recommendationRef: issues && issues.length > 0 ? '' : getRecommendation(d)
            };
        }
        return null;
    }

    if (isDefined(rhdaData, 'providers')) {
        Object.entries(rhdaData.providers).map(([providerName, providerData]: [string, any]) => {
            if (isDefined(providerData, 'status', 'ok') && providerData.status.ok) {
                if (isDefined(providerData, 'sources')) {
                    Object.entries(providerData.sources).map(([sourceName, sourceData]: [string, any]) => {
                        sources.push({ providerId: providerName, sourceId: sourceName, dependencies: getDependencies(sourceData), summary: getSummary(sourceData)});
                    });
                }
            } else {
                failedProviders.push(providerName);
            }
        });

        if (failedProviders.length !== 0) {
            ghCore.warning(`The component analysis couldn't fetch data from the following providers: [${failedProviders.join(', ')}]`);
        }

        sources.forEach(source => {

            updateVulnerabilitySeverity(source.summary);

            source.dependencies.forEach(d => {
                const dd = getDependencyData(d, source);
                if (dd) {
                    dependencies[dd.ref] = dependencies[dd.ref] || [];
                    dependencies[dd.ref].push(dd);
                }
            });
        });
    }

    Object.entries(dependencies).map(([ref, dependencyData]: [string, types.IDependencyData[]]) => {
        const refHasIssues = dependencyData.some(dd => {
            if (dd.issues && dd.issues.length > 0) { 
                return true; 
            } else {
                return dd.transitives && dd.transitives.length > 0 && dd.transitives.some(td => td.issues && td.issues.length > 0);
            }
        });
        dependencyData.forEach((dd: types.IDependencyData) => {
            const res = result.rhdaToResult(dd, manifestFilePath, lines, refHasIssues);
                    finalResults.push(...res[0]);
                    finalRules.push(...res[1]);
        })
        

    });

    ghCore.debug(`Number of results: ${finalResults.length}`);

    ghCore.debug(`Number of rules: ${finalRules.length}`);

    ghCore.debug(`Sarif schema version is ${SARIF_SCHEMA_VERSION}`);

    return {
        sarifObject: {
            $schema: SARIF_SCHEMA_URL,
            version: SARIF_SCHEMA_VERSION,
            runs: [
                {
                    tool: {
                        driver: {
                            name: "Red Hat Dependency Analytics",
                            rules: finalRules,
                        },
                    },
                    results: finalResults,
                },
            ],
        },
        VulnerabilitySeverity: vulSeverity,
    };
}

export async function generateSarif(rhdaReportJson: any, manifestFilePath: string): Promise<{ sarifObject: any, VulnerabilitySeverity: string }> {
    /*
    * creates a SARIF and writes it to file
    */

    const { sarifObject, VulnerabilitySeverity } = rhdaJsonToSarif(rhdaReportJson, manifestFilePath);

    if (!sarifObject.$schema) {
        throw new Error(`No $schema key for SARIF file, cannot proceed.`);
    }

    return { sarifObject, VulnerabilitySeverity };
}