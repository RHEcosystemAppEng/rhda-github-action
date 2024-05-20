import * as ghCore from '@actions/core';
import * as sarif from "sarif";
import * as fs from "fs";

import * as result from './results.js';
import * as types from './types.js';
import { SARIF_SCHEMA_URL, SARIF_SCHEMA_VERSION } from '../constants.js';
import { isDefined } from '../utils.js'

function rhdaJsonToSarif(rhdaData: types.RhdaData, manifestFilePath: string) {
    /*
    * creates results and rules and structures SARIF
    */

    let finalResults: sarif.Result[] = [];
    let finalRules: sarif.ReportingDescriptor[] = [];
    const dependencies: Map<string, types.IDependencyData[]> = new Map<string, types.IDependencyData[]>()
    const failedProviders: string[] = [];
    const sources: types.ISource[] = [];
        
    const manifestData = fs.readFileSync(manifestFilePath, "utf-8");
    const lines = manifestData.split(/\r\n|\n/);

    const getRecommendation = (dependency: any): string => {
        return isDefined(dependency, 'recommendation') ? resolveVersionFromReference(dependency.recommendation) : '';
    }

    const getDependencies = (sourceData: any): any[] => {
        return isDefined(sourceData, 'dependencies') ? sourceData.dependencies : [];
    }

    const getDependencyData = (d: any, source: types.ISource): types.IDependencyData => {
        if (isDefined(d, 'ref')) {

            const issues: types.IIssue[] = isDefined(d, 'issues') ? d.issues : null;
            const transitives: types.IDependencyData[] = isDefined(d, 'transitive') ? d.transitive.map(t => getDependencyData(t, source)) : null;

            let dependencyName = resolveDependencyFromReference(d.ref).split('@')[0];
            let dependencyVersion = resolveVersionFromReference(d.ref);
            let ecosystem = resolveEcosystemFromReference(d.ref);
            dependencyName = ecosystem === 'maven' ? dependencyName.split('/')[1] : dependencyName;

            return {
                ref: d.ref,
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
        Object.entries(rhdaData.providers).map(([providerName, providerData]) => {
            if (isDefined(providerData, 'status', 'ok') && providerData.status.ok) {
                if (isDefined(providerData, 'sources')) {
                    Object.entries(providerData.sources).map(([sourceName, sourceData]) => {
                        sources.push({ providerId: providerName, sourceId: sourceName, dependencies: getDependencies(sourceData) });
                    });
                }
            } else {
                failedProviders.push(providerName);
            }
        });

        if (failedProviders.length !== 0) {
            const errMsg = `The component analysis couldn't fetch data from the following providers: [${failedProviders.join(', ')}]`;
            // connection.console.warn(`Component Analysis Error: ${errMsg}`);
            // connection.sendNotification('caError', {
            //     errorMessage: errMsg,
            //     uri: diagnosticFilePath,
            // });
        }

        sources.forEach(source => {
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
    };
}

export async function generateSarif(rhdaReportJson: any, manifestFilePath: string): Promise<any> {
    /*
    * creates a SARIF and writes it to file
    */

    const convertedSarif = rhdaJsonToSarif(rhdaReportJson, manifestFilePath);

    if (!convertedSarif.$schema) {
        throw new Error(`No $schema key for SARIF file, cannot proceed.`);
    }

    return convertedSarif;
}

function resolveDependencyFromReference(ref: string): string {
    return ref.replace(`pkg:${resolveEcosystemFromReference(ref)}/`, '').split('?')[0];
}

function resolveEcosystemFromReference(ref: string): string {
    const match = ref.match(/pkg:(.*?)\//);

    if (match && match[1]) {
        return match[1];
    }

    return undefined
};

function resolveVersionFromReference(ref: string): string {
    const resolvedRef = resolveDependencyFromReference(ref);
    return resolvedRef.split('@')[1];
}