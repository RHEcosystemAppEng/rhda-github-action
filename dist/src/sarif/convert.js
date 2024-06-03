import * as ghCore from '@actions/core';
import * as fs from "fs";
import * as result from './results.js';
import * as constants from '../constants.js';
import { isDefined } from '../utils.js';
const FROM_REGEX = /^\s*FROM\s+(.*)/;
const ARG_REGEX = /^\s*ARG\s+(.*)/;
export function resolveDependencyFromReference(ref) {
    return ref.replace(`pkg:${resolveEcosystemFromReference(ref)}/`, '').split('?')[0];
}
export function resolveEcosystemFromReference(ref) {
    const match = ref.match(/pkg:(.*?)\//);
    if (match && match[1]) {
        return match[1];
    }
    return undefined;
}
;
export function resolveVersionFromReference(ref) {
    const resolvedRef = resolveDependencyFromReference(ref);
    return resolvedRef.split('@')[1] || '';
}
function getManifestDataLines(filepath, ecosystem) {
    const manifestData = fs.readFileSync(filepath, "utf-8");
    const lines = manifestData.split(/\r\n|\n/);
    const args = new Map();
    const replaceArgsInString = (str) => {
        args.forEach((value, key) => {
            const regexWithBraces = new RegExp(`\\$\\{${key}\\}`, 'g');
            const regexWithoutBraces = new RegExp(`\\$${key}\\b`, 'g');
            str = str.replace(regexWithBraces, value).replace(regexWithoutBraces, value);
        });
        return str;
    };
    if (ecosystem === constants.GRADLE) {
        let isSingleArgument = false;
        let isArgumentBlock = false;
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
                }
                else {
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
        return replaceArgsInString(manifestData).split(/\r\n|\n/);
    }
    if (ecosystem === constants.DOCKER) {
        lines.forEach(line => {
            const argMatch = line.match(ARG_REGEX);
            if (argMatch) {
                const argData = argMatch[1].trim().split('=');
                args.set(argData[0], argData[1]);
            }
        });
        return replaceArgsInString(manifestData).split(/\r\n|\n/);
    }
    return lines;
}
function rhdaJsonToSarif(rhdaData, manifestFilePath, ecosystem, vulSeverity, imageRef) {
    /*
    * creates results and rules and structures SARIF
    */
    let finalResults = [];
    let finalRules = [];
    const dependencies = new Map();
    const failedProviders = [];
    const sources = [];
    const getRecommendation = (dependency) => {
        return isDefined(dependency, 'recommendation') ? resolveVersionFromReference(dependency.recommendation) : '';
    };
    const getSummary = (sourceData) => {
        return isDefined(sourceData, 'summary') ? sourceData.summary : null;
    };
    const getDependencies = (sourceData) => {
        return isDefined(sourceData, 'dependencies') ? sourceData.dependencies : [];
    };
    const updateVulnerabilitySeverity = (summary) => {
        if (summary.critical > 0 || summary.high > 0) {
            vulSeverity = 'error';
        }
        else if (vulSeverity != 'error' && (summary.medium > 0 || summary.low > 0)) {
            vulSeverity = 'warning';
        }
    };
    const getDependencyData = (d, source) => {
        if (isDefined(d, 'ref')) {
            const issues = isDefined(d, 'issues') ? d.issues : null;
            const transitives = isDefined(d, 'transitive') ? d.transitive.map(t => getDependencyData(t, source)) : null;
            let dependencyGroup;
            let dependencyName = resolveDependencyFromReference(d.ref).split('@')[0];
            let dependencyVersion = resolveVersionFromReference(d.ref);
            const refEcosystem = resolveEcosystemFromReference(d.ref);
            if (refEcosystem === constants.MAVEN || refEcosystem === constants.GRADLE) {
                dependencyGroup = dependencyName.split('/')[0];
                dependencyName = dependencyName.split('/')[1];
            }
            return {
                imageRef: imageRef,
                depRef: d.ref,
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
    };
    const getStartLine = (dd) => {
        if (ecosystem === constants.MAVEN) {
            return 2 +
                lines.findIndex((line) => {
                    return line.includes(`<artifactId>${dd.depName}</artifactId>`);
                });
        }
        ;
        if (ecosystem === constants.GRADLE) {
            const regexGroup = new RegExp(`group:\\s*(['"])${dd.depGroup}\\1`);
            const regexName = new RegExp(`name:\\s*(['"])${dd.depName}\\1`);
            if (dd.depVersion) {
                const regexVersion = new RegExp(`version:\\s*(['"])${dd.depVersion}\\1`);
                const regexColonWithVersion = new RegExp(`${dd.depGroup}:${dd.depName}:${dd.depVersion}`);
                return 1 +
                    lines.findIndex((line) => {
                        return (regexName.test(line) && regexGroup.test(line) && regexVersion.test(line)) || regexColonWithVersion.test(line);
                    });
            }
            const regexColonWOVersion = new RegExp(`${dd.depGroup}:${dd.depName}`);
            return 1 +
                lines.findIndex((line) => {
                    return (regexName.test(line) && regexGroup.test(line)) || regexColonWOVersion.test(line);
                });
        }
        ;
        if (ecosystem === constants.DOCKER) {
            return 1 +
                lines.findIndex((line) => {
                    const match = line.match(FROM_REGEX);
                    return match && (match[1].includes(dd.imageRef) || match[1].includes(dd.imageRef.replace(':latest', '')));
                });
        }
        ;
        return 1 +
            lines.findIndex((line) => {
                return line.includes(dd.depName);
            });
    };
    const lines = getManifestDataLines(manifestFilePath, ecosystem);
    if (isDefined(rhdaData, 'providers')) {
        Object.entries(rhdaData.providers).map(([providerName, providerData]) => {
            if (isDefined(providerData, 'status', 'ok') && providerData.status.ok) {
                if (isDefined(providerData, 'sources')) {
                    Object.entries(providerData.sources).map(([sourceName, sourceData]) => {
                        sources.push({ providerId: providerName, sourceId: sourceName, dependencies: getDependencies(sourceData), summary: getSummary(sourceData) });
                    });
                }
            }
            else {
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
                    const refKey = imageRef || dd.depRef;
                    dependencies[refKey] = dependencies[refKey] || [];
                    dependencies[refKey].push(dd);
                }
            });
        });
    }
    Object.entries(dependencies).map(([ref, dependencyData]) => {
        const refHasIssues = dependencyData.some(dd => {
            if (dd.issues && dd.issues.length > 0) {
                return true;
            }
            else {
                return dd.transitives && dd.transitives.length > 0 && dd.transitives.some(td => td.issues && td.issues.length > 0);
            }
        });
        dependencyData.forEach((dd) => {
            const startLine = getStartLine(dd);
            const res = result.rhdaToResult(dd, manifestFilePath, startLine, refHasIssues);
            finalResults.push(...res[0]);
            finalRules.push(...res[1]);
        });
    });
    return {
        finalResults: finalResults,
        finalRules: finalRules,
        vulSeverity: vulSeverity,
    };
}
function createSarifObject(finalResults, finalRules) {
    return {
        $schema: constants.SARIF_SCHEMA_URL,
        version: constants.SARIF_SCHEMA_VERSION,
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
export async function generateSarif(rhdaReportJson, manifestFilePath, ecosystem) {
    /*
    * creates a SARIF and writes it to file
    */
    let vulSeverity = "none";
    let finalResults = [];
    let finalRules = [];
    const updateVulnerabilitySeverity = (returnedVulSeverity) => {
        if (constants.vulnerabilitySeverityOrder[returnedVulSeverity] > constants.vulnerabilitySeverityOrder[vulSeverity]) {
            vulSeverity = returnedVulSeverity;
        }
    };
    if (ecosystem === constants.DOCKER) {
        Object.entries(rhdaReportJson).map(([imageRef, imageData]) => {
            const { finalResults: results, finalRules: rules, vulSeverity: returnedVulSeverity } = rhdaJsonToSarif(imageData, manifestFilePath, ecosystem, vulSeverity, imageRef);
            updateVulnerabilitySeverity(returnedVulSeverity);
            finalResults.push(...results);
            finalRules.push(...rules);
        });
    }
    else {
        const { finalResults: results, finalRules: rules, vulSeverity: returnedVulSeverity } = rhdaJsonToSarif(rhdaReportJson, manifestFilePath, ecosystem, vulSeverity);
        updateVulnerabilitySeverity(returnedVulSeverity);
        finalResults.push(...results);
        finalRules.push(...rules);
    }
    const sarifObject = createSarifObject(finalResults, finalRules);
    if (!sarifObject.$schema) {
        throw new Error(`No $schema key for SARIF file, cannot proceed.`);
    }
    return { sarifObject, vulSeverity };
}
//# sourceMappingURL=convert.js.map