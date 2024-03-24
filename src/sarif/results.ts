import * as sarif from "sarif";
import path from 'path';

import * as types from './types.js';
import { fetchIssueRules, fetchRecomendationRules } from './rules.js';

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

export function rhdaToResult(
    rhdaDependency: types.IDependencyData,
    manifestFilePath: string,
    lines: string[],
    refHasIssues: boolean,
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {

    const startLine = lines.findIndex((line) => {
        return line.includes(rhdaDependency.ecosystem === 'maven' ? `<artifactId>${rhdaDependency.depName}</artifactId>` : rhdaDependency.depName);
    });

    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];
    if (rhdaDependency.issues && rhdaDependency.issues.length > 0) {
    
        rhdaDependency.issues.forEach((issue) => {
            let textMessage = `This line introduces a "${issue.title}" vulnerability with `
                + `${issue.severity} severity.\n`
                + `Vulnerable dependency is ${rhdaDependency.depName} version ${rhdaDependency.depVersion}.`;

            if (issue.remediation.trustedContent) {
                textMessage = `${textMessage}\nRecommended remediation version: ${resolveVersionFromReference(issue.remediation.trustedContent.ref)}`;
            }

            const result = fetchResult(
                issue.id,
                textMessage,
                manifestFilePath,
                startLine +  (rhdaDependency.ecosystem === 'maven' ? 2 : 1),
            )

            const rule = fetchIssueRules(issue);

            rules.push(rule);
            results.push(result);
        });

    }  else if (!refHasIssues && rhdaDependency.recommendationRef) {

        let textMessage = `Recommended Red Hat verified version: ${rhdaDependency.recommendationRef}.`;

        const result = fetchResult(
            rhdaDependency.recommendationRef,
            textMessage,
            manifestFilePath,
            startLine +  (rhdaDependency.ecosystem === 'maven' ? 2 : 1),
        )

        const rule = fetchRecomendationRules(rhdaDependency.recommendationRef);

        rules.push(rule);
        results.push(result);
    }

    return [ results, rules ];
}

function fetchResult(
    ruleId: string,
    textMessage: string,
    manifestFilePath: string, 
    startLine: number,
){
    const message: sarif.Message = {
        text: textMessage,
    };
    const artifactLocation: sarif.ArtifactLocation = {
        // GitHub seems to fail to find the file if windows paths are used
        uri: manifestFilePath.split(path.sep).join(path.posix.sep),
        // uri: manifestFile.slice(manifestFile.lastIndexOf("/") + 1),
        // uriBaseId: manifestFile.slice(0, manifestFile.lastIndexOf("/")),
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
        locations: [ location ],
    };

    return result;
}