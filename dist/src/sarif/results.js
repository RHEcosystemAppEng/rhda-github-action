import path from 'path';
import { fetchIssueRules, fetchRecomendationRules } from './rules.js';
import { resolveDependencyFromReference, resolveVersionFromReference } from './convert.js';
export function rhdaToResult(rhdaDependency, manifestFilePath, startLine, refHasIssues) {
    const results = [];
    const rules = [];
    const generateIssueResults = (issues, dependencyData, isDirect) => {
        issues.forEach((issue) => {
            let textMessage = `This line introduces a "${issue.title}" vulnerability with `
                + `${issue.severity} severity.\n`
                + `Vulnerability data provider is ${dependencyData.providerId}.\n`
                + `Vulnerability data source is ${dependencyData.sourceId}.\n`
                + `Vulnerable${isDirect ? '' : ' transitive'} dependency is ${dependencyData.depGroup ? `${dependencyData.depGroup}/` : ''}${dependencyData.depName}${dependencyData.depVersion ? ` version ${dependencyData.depVersion}` : ''}.`;
            if (issue.remediation.trustedContent) {
                textMessage = `${textMessage}\nRecommended remediation version: ${resolveVersionFromReference(issue.remediation.trustedContent.ref)}`;
            }
            const result = fetchResult(issue.id, textMessage, manifestFilePath, startLine);
            const directRef = rhdaDependency.imageRef ? rhdaDependency.imageRef : resolveDependencyFromReference(rhdaDependency.depRef);
            const rule = fetchIssueRules(issue, directRef);
            rules.push(rule);
            results.push(result);
        });
    };
    if (refHasIssues) {
        if (rhdaDependency.issues && rhdaDependency.issues.length > 0) {
            generateIssueResults(rhdaDependency.issues, rhdaDependency, true);
        }
        if (rhdaDependency.transitives && rhdaDependency.transitives.length > 0) {
            rhdaDependency.transitives.forEach((td) => {
                if (td.issues && td.issues.length > 0) {
                    generateIssueResults(td.issues, td, false);
                }
            });
        }
    }
    else if (!refHasIssues && rhdaDependency.recommendationRef) {
        let textMessage = `Recommended Red Hat verified version: ${rhdaDependency.recommendationRef}.`;
        const result = fetchResult(rhdaDependency.recommendationRef, textMessage, manifestFilePath, startLine);
        const rule = fetchRecomendationRules(rhdaDependency.recommendationRef);
        rules.push(rule);
        results.push(result);
    }
    return [results, rules];
}
function fetchResult(ruleId, textMessage, manifestFilePath, startLine) {
    const message = {
        text: textMessage,
    };
    const artifactLocation = {
        // GitHub seems to fail to find the file if windows paths are used
        uri: manifestFilePath.split(path.sep).join(path.posix.sep),
        // uri: manifestFile.slice(manifestFile.lastIndexOf("/") + 1),
        // uriBaseId: manifestFile.slice(0, manifestFile.lastIndexOf("/")),
    };
    const region = {
        startLine: startLine,
    };
    const physicalLocation = {
        artifactLocation,
        region,
    };
    const location = {
        physicalLocation,
    };
    const result = {
        ruleId,
        message,
        locations: [location],
    };
    return result;
}
//# sourceMappingURL=results.js.map