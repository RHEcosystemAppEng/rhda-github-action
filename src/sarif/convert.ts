import * as ghCore from '@actions/core';
import * as sarif from 'sarif';
import * as fs from 'fs';

import * as result from './results.js';
import * as types from './types.js';
import * as constants from '../constants.js';
import { isDefined } from '../utils.js';

const FROM_REGEX: RegExp = /^\s*FROM\s+(.*)/;
const ARG_REGEX: RegExp = /^\s*ARG\s+(.*)/;

/**
 * Resolves the dependency from a given reference.
 * @param ref - The reference to resolve.
 * @returns The cleaned dependency reference.
 */
export function resolveDependencyFromReference(ref: string): string {
    return ref
        .replace(`pkg:${resolveEcosystemFromReference(ref)}/`, '')
        .split('?')[0];
}

/**
 * Resolves the ecosystem from a given reference.
 * @param ref - The reference to resolve.
 * @returns The ecosystem name or undefined.
 */
export function resolveEcosystemFromReference(ref: string): string | undefined {
    const match = ref.match(/pkg:(.*?)\//);

    if (match && match[1]) {
        return match[1];
    }

    return undefined;
}

/**
 * Resolves the version from a given reference.
 * @param ref - The reference to resolve.
 * @returns The version extracted from the reference.
 */
export function resolveVersionFromReference(ref: string): string {
    const resolvedRef = resolveDependencyFromReference(ref);
    return resolvedRef.split('@')[1] || '';
}

/**
 * Retrieves manifest data for a given file and ecosystem, substituting arguments with their values and splits manifest into lines.
 * @param filepath - The path to the manifest file.
 * @param ecosystem - The ecosystem related to the manifest.
 * @returns An array of lines from the manifest file.
 */
function getManifestDataLines(filepath: string, ecosystem: string): string[] {
    const manifestData = fs.readFileSync(filepath, 'utf-8');

    const lines = manifestData.split(/\r\n|\n/);

    const args: Map<string, string> = new Map<string, string>();

    const replaceArgsInString = (str: string): string => {
        args.forEach((value, key) => {
            const regexWithBraces = new RegExp(`\\$\\{${key}\\}`, 'g');
            const regexWithoutBraces = new RegExp(`\\$${key}\\b`, 'g');

            str = str
                .replace(regexWithBraces, value)
                .replace(regexWithoutBraces, value);
        });
        return str;
    };

    if (ecosystem === constants.GRADLE) {
        let isSingleArgument: boolean = false;
        let isArgumentBlock: boolean = false;
        lines.forEach((line) => {
            const cleanLine = line
                .split('//')[0]
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .trim(); // Remove comments

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

                const argDataMatch = cleanLine.match(
                    /\b(\w+)\s*=\s*(['"])(.*?)\2/,
                );
                if (argDataMatch) {
                    args.set(argDataMatch[1].trim(), argDataMatch[3].trim());
                }
            }
        });

        return replaceArgsInString(manifestData).split(/\r\n|\n/);
    }

    if (ecosystem === constants.DOCKER) {
        lines.forEach((line) => {
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

/**
 * Converts RHDA JSON data to SARIF components.
 * @param rhdaData - The RHDA report JSON data.
 * @param manifestFilePath - The path to the manifest file.
 * @param ecosystem - The ecosystem related to the analysis.
 * @param vulSeverity - The current highest severity level of vulnerabilities.
 * @param imageRef - Optional image reference (for Docker ecosystem).
 * @returns SARIF results, rules, and updated vulnerability severity level.
 */
function rhdaJsonToSarif(
    rhdaData: any,
    manifestFilePath: string,
    ecosystem: string,
    vulSeverity: constants.VulnerabilitySeverity,
    imageRef?: string,
): {
    finalResults: sarif.Result[];
    finalRules: sarif.ReportingDescriptor[];
    vulSeverity: constants.VulnerabilitySeverity;
} {
    const finalResults: sarif.Result[] = [];
    const finalRules: sarif.ReportingDescriptor[] = [];
    const dependencies: Map<string, types.IDependencyData[]> = new Map<
        string,
        types.IDependencyData[]
    >();
    const failedProviders: string[] = [];
    const sources: types.ISource[] = [];

    const getRecommendation = (dependency: any): string => {
        return isDefined(dependency, 'recommendation')
            ? resolveVersionFromReference(dependency.recommendation)
            : '';
    };

    const getSummary = (sourceData: any): types.ISummary => {
        return isDefined(sourceData, 'summary') ? sourceData.summary : null;
    };

    const getDependencies = (sourceData: any): any[] => {
        return isDefined(sourceData, 'dependencies')
            ? sourceData.dependencies
            : [];
    };

    const updateVulnerabilitySeverity = (summary: types.ISummary): void => {
        if (summary.critical > 0 || summary.high > 0) {
            vulSeverity = 'error';
        } else if (
            vulSeverity !== 'error' &&
            (summary.medium > 0 || summary.low > 0)
        ) {
            vulSeverity = 'warning';
        }
    };

    const getDependencyData = (
        d: any,
        source: types.ISource,
    ): types.IDependencyData => {
        if (isDefined(d, 'ref')) {
            const issues: types.IIssue[] = isDefined(d, 'issues')
                ? d.issues
                : null;
            const transitives: types.IDependencyData[] = isDefined(
                d,
                'transitive',
            )
                ? d.transitive.map((t) => getDependencyData(t, source))
                : null;

            let dependencyGroup: string;
            let dependencyName = resolveDependencyFromReference(d.ref).split(
                '@',
            )[0];
            const dependencyVersion = resolveVersionFromReference(d.ref);
            const refEcosystem = resolveEcosystemFromReference(d.ref);
            if (
                refEcosystem === constants.MAVEN ||
                refEcosystem === constants.GRADLE
            ) {
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
                recommendationRef:
                    issues && issues.length > 0 ? '' : getRecommendation(d),
            };
        }
        return null;
    };

    const getStartLine = (dd: types.IDependencyData): number => {
        if (ecosystem === constants.MAVEN) {
            return (
                2 +
                lines.findIndex((line) => {
                    return line.includes(
                        `<artifactId>${dd.depName}</artifactId>`,
                    );
                })
            );
        }

        if (ecosystem === constants.GRADLE) {
            const regexGroup = new RegExp(`group:\\s*(['"])${dd.depGroup}\\1`);
            const regexName = new RegExp(`name:\\s*(['"])${dd.depName}\\1`);

            if (dd.depVersion) {
                const regexVersion = new RegExp(
                    `version:\\s*(['"])${dd.depVersion}\\1`,
                );

                const regexColonWithVersion = new RegExp(
                    `${dd.depGroup}:${dd.depName}:${dd.depVersion}`,
                );
                return (
                    1 +
                    lines.findIndex((line) => {
                        return (
                            (regexName.test(line) &&
                                regexGroup.test(line) &&
                                regexVersion.test(line)) ||
                            regexColonWithVersion.test(line)
                        );
                    })
                );
            }

            const regexColonWOVersion = new RegExp(
                `${dd.depGroup}:${dd.depName}`,
            );
            return (
                1 +
                lines.findIndex((line) => {
                    return (
                        (regexName.test(line) && regexGroup.test(line)) ||
                        regexColonWOVersion.test(line)
                    );
                })
            );
        }

        if (ecosystem === constants.DOCKER) {
            return (
                1 +
                lines.findIndex((line) => {
                    const match = line.match(FROM_REGEX);
                    return (
                        match &&
                        (match[1].includes(dd.imageRef) ||
                            match[1].includes(
                                dd.imageRef.replace(':latest', ''),
                            ))
                    );
                })
            );
        }

        return (
            1 +
            lines.findIndex((line) => {
                return line.includes(dd.depName);
            })
        );
    };

    const lines = getManifestDataLines(manifestFilePath, ecosystem);

    if (isDefined(rhdaData, 'providers')) {
        Object.entries(rhdaData.providers).map(
            ([providerName, providerData]: [string, any]) => {
                if (
                    isDefined(providerData, 'status', 'ok') &&
                    providerData.status.ok
                ) {
                    if (isDefined(providerData, 'sources')) {
                        Object.entries(providerData.sources).map(
                            ([sourceName, sourceData]: [string, any]) => {
                                sources.push({
                                    providerId: providerName,
                                    sourceId: sourceName,
                                    dependencies: getDependencies(sourceData),
                                    summary: getSummary(sourceData),
                                });
                            },
                        );
                    }
                } else {
                    failedProviders.push(providerName);
                }
            },
        );

        if (failedProviders.length !== 0) {
            ghCore.warning(
                `The component analysis couldn't fetch data from the following providers: [${failedProviders.join(', ')}]`,
            );
        }

        sources.forEach((source) => {
            if (source.summary) {
                updateVulnerabilitySeverity(source.summary);
            }

            source.dependencies.forEach((d) => {
                const dd = getDependencyData(d, source);
                if (dd) {
                    const refKey = imageRef || dd.depRef;
                    dependencies[refKey] = dependencies[refKey] || [];
                    dependencies[refKey].push(dd);
                }
            });
        });
    }

    Object.values(dependencies).map(
        (dependencyData: types.IDependencyData[]) => {
            const refHasIssues = dependencyData.some((dd) => {
                if (dd.issues && dd.issues.length > 0) {
                    return true;
                } else {
                    return (
                        dd.transitives &&
                        dd.transitives.length > 0 &&
                        dd.transitives.some(
                            (td) => td.issues && td.issues.length > 0,
                        )
                    );
                }
            });

            dependencyData.forEach((dd: types.IDependencyData) => {
                const startLine = getStartLine(dd);
                if (startLine > 0) {
                    const res = result.rhdaToResult(
                        dd,
                        manifestFilePath,
                        startLine,
                        refHasIssues,
                    );
                    finalResults.push(...res[0]);
                    finalRules.push(...res[1]);
                }
            });
        },
    );

    return {
        finalResults: finalResults,
        finalRules: finalRules,
        vulSeverity: vulSeverity,
    };
}

/**
 * Creates a SARIF object from final results and rules.
 * @param finalResults - Array of SARIF results.
 * @param finalRules - Array of SARIF rules.
 * @returns SARIF object conforming to the SARIF schema.
 */
function createSarifObject(
    finalResults: sarif.Result[],
    finalRules: sarif.ReportingDescriptor[],
): any {
    return {
        $schema: constants.SARIF_SCHEMA_URL,
        version: constants.SARIF_SCHEMA_VERSION,
        runs: [
            {
                tool: {
                    driver: {
                        name: 'Red Hat Dependency Analytics',
                        rules: finalRules,
                    },
                },
                results: finalResults,
            },
        ],
    };
}

/**
 * Generates SARIF output from RHDA report JSON data.
 * @param rhdaReportJson - The RHDA report JSON data.
 * @param manifestFilePath - The path to the manifest file.
 * @param ecosystem - The ecosystem related to the analysis.
 * @returns Promise resolving to an object containing SARIF data and vulnerability severity level.
 */
export async function generateSarif(
    rhdaReportJson: any,
    manifestFilePath: string,
    ecosystem: string,
): Promise<{ sarifObject: any; vulSeverity: constants.VulnerabilitySeverity }> {
    let vulSeverity: constants.VulnerabilitySeverity = 'none';
    const finalResults: sarif.Result[] = [];
    const finalRules: sarif.ReportingDescriptor[] = [];

    const updateVulnerabilitySeverity = (
        returnedVulSeverity: constants.VulnerabilitySeverity,
    ): void => {
        if (
            constants.vulnerabilitySeverityOrder[returnedVulSeverity] >
            constants.vulnerabilitySeverityOrder[vulSeverity]
        ) {
            vulSeverity = returnedVulSeverity;
        }
    };

    if (ecosystem === constants.DOCKER) {
        Object.entries(rhdaReportJson).map(
            ([imageRef, imageData]: [string, any]) => {
                const {
                    finalResults: results,
                    finalRules: rules,
                    vulSeverity: returnedVulSeverity,
                } = rhdaJsonToSarif(
                    imageData,
                    manifestFilePath,
                    ecosystem,
                    vulSeverity,
                    imageRef,
                );
                updateVulnerabilitySeverity(returnedVulSeverity);
                finalResults.push(...results);
                finalRules.push(...rules);
            },
        );
    } else {
        const {
            finalResults: results,
            finalRules: rules,
            vulSeverity: returnedVulSeverity,
        } = rhdaJsonToSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
            vulSeverity,
        );
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
