import * as sarif from 'sarif';
import path from 'path';

import * as types from './types.js';
import { fetchIssueRules, fetchRecomendationRules } from './rules.js';
import {
    resolveDependencyFromReference,
    resolveVersionFromReference,
} from './convert.js';
import { REDHAT_CATALOG } from '../constants.js';

/**
 * Converts RHDA dependency data into SARIF results and rules.
 * @param rhdaDependency - The RHDA dependency data to convert.
 * @param manifestFilePath - The path to the manifest file being analyzed.
 * @param startLine - The starting line number of the dependency from the manifest file.
 * @param refHasIssues - Indicates whether the dependency has issues.
 * @returns An array containing SARIF results and rules.
 */
export function rhdaToResult(
    rhdaDependency: types.IDependencyData,
    manifestFilePath: string,
    startLine: number,
    refHasIssues: boolean,
): [sarif.Result[], sarif.ReportingDescriptor[]] {
    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];

    const generateIssueResults = (
        issues: types.IIssue[],
        dependencyData: types.IDependencyData,
        isDirect: boolean,
    ) => {
        issues.forEach((issue) => {
            let textMessage =
                `This line introduces a "${issue.title}" vulnerability with ` +
                `${issue.severity} severity.\n` +
                `Vulnerability data provider is ${dependencyData.providerId}.\n` +
                `Vulnerability data source is ${dependencyData.sourceId}.\n` +
                `Vulnerable${isDirect ? '' : ' transitive'} dependency is ${dependencyData.depGroup ? `${dependencyData.depGroup}/` : ''}${dependencyData.depName}${dependencyData.depVersion ? ` version ${dependencyData.depVersion}` : ''}.`;

            if (issue.remediation.trustedContent) {
                textMessage = `${textMessage}\nRecommended remediation version: ${resolveVersionFromReference(issue.remediation.trustedContent.ref)}`;
            }

            const result = fetchResult(
                issue.id,
                textMessage,
                manifestFilePath,
                startLine,
            );

            const directRef = rhdaDependency.imageRef
                ? rhdaDependency.imageRef
                : resolveDependencyFromReference(rhdaDependency.depRef);
            const rule = fetchIssueRules(issue, directRef);

            rules.push(rule);
            results.push(result);
        });
    };

    if (refHasIssues) {
        if (rhdaDependency.issues && rhdaDependency.issues.length > 0) {
            generateIssueResults(rhdaDependency.issues, rhdaDependency, true);
        }

        if (
            rhdaDependency.transitives &&
            rhdaDependency.transitives.length > 0
        ) {
            rhdaDependency.transitives.forEach((td: types.IDependencyData) => {
                if (td.issues && td.issues.length > 0) {
                    generateIssueResults(td.issues, td, false);
                }
            });
        }
    } else if (!refHasIssues && rhdaDependency.recommendationRef) {
        const textMessage = rhdaDependency.imageRef
            ? `Switch to [Red Hat UBI](${REDHAT_CATALOG}) for enhanced security and enterprise-grade stability`
            : `Recommended Red Hat verified version: ${rhdaDependency.recommendationRef}.`;

        const result = fetchResult(
            rhdaDependency.recommendationRef,
            textMessage,
            manifestFilePath,
            startLine,
        );

        const rule = fetchRecomendationRules(rhdaDependency.recommendationRef);

        rules.push(rule);
        results.push(result);
    }

    return [results, rules];
}

/**
 * Constructs a SARIF result object based on the provided data.
 * @param ruleId - The ID of the rule associated with the result.
 * @param textMessage - The message associated with the result.
 * @param manifestFilePath - The path to the manifest file being analyzed.
 * @param startLine - The starting line number of the dependency from the manifest file.
 * @returns A SARIF result object.
 */
function fetchResult(
    ruleId: string,
    textMessage: string,
    manifestFilePath: string,
    startLine: number,
) {
    const message: sarif.Message = {
        text: textMessage,
    };
    const artifactLocation: sarif.ArtifactLocation = {
        uri: path
            .relative(process.cwd(), manifestFilePath)
            .split(path.sep)
            .join(path.posix.sep),
    };
    const region: sarif.Region = {
        startLine: startLine,
    };
    const physicalLocation: sarif.PhysicalLocation = {
        artifactLocation,
        region,
    };
    const location: sarif.Location = {
        physicalLocation,
    };

    const result: sarif.Result = {
        ruleId,
        message,
        locations: [location],
    };

    return result;
}
