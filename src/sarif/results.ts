import * as sarif from "sarif";
import * as fs from "fs";
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
    /*
    * creates results
    */

    rhdaDependency: types.IDependencyData,
    manifestFilePath: string,
    lines: string[],
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {
    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];

    const startLine = lines.findIndex((line) => {
        return line.includes(rhdaDependency.ecosystem === 'maven' ? `<artifactId>${rhdaDependency.depName}</artifactId>` : rhdaDependency.depName);
    });
    
    if (rhdaDependency.issues) {
        
        const fetchedResults = fetchIssueResults(
            rhdaDependency.issues,
            manifestFilePath, 
            startLine, 
            rhdaDependency.depName,
            rhdaDependency.depVersion,
            rhdaDependency.ecosystem
        );

        results.push(...fetchedResults[0]);
        rules.push(...fetchedResults[1]);
    }  else if (rhdaDependency.recommendationRef) {
        console.log(`*******Recommended ${rhdaDependency.recommendationRef} ********* `)
        const fetchedResults = fetchReccomendationResults(
            rhdaDependency.recommendationRef,
            manifestFilePath, 
            startLine, 
            rhdaDependency.depName,
        );

        results.push(...fetchedResults[0]);
        rules.push(...fetchedResults[1]);
    }

    return [ results, rules ];
}

function fetchIssueResults(
    /*
    * creates one single result
    */

    rhdaIssues: types.IIssue[],
    manifestFilePath: string, 
    startLine: number,
    dependencyName: string,
    dependencyVersion: string,
    ecosystem: string
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {

    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];

    rhdaIssues.forEach((issue) => {
        
        const ruleId = issue.id;
        let textMessage = `This line introduces a "${issue.title}" vulnerability with `
            + `${issue.severity} severity.\n`
            + `Vulnerable dependency is ${dependencyName} version ${dependencyVersion}.`;

        if (issue.remediation.trustedContent) {
            textMessage = `${textMessage}\nRecommended remediation version: ${resolveVersionFromReference(issue.remediation.trustedContent.ref)}`;
        }

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
            startLine: startLine +  (ecosystem === 'maven' ? 2 : 1),
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

        results.push(result);

        const fetchedRules = fetchIssueRules(issue);

        rules.push(fetchedRules);

    });

    return [ results, rules ];

}

function fetchReccomendationResults(
    /*
    * creates one single result
    */

    recommendation: string,
    manifestFilePath: string, 
    startLine: number,
    ecosystem: string
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {

    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];

    const ruleId = recommendation+startLine.toString();
    let textMessage = `Recommended Red Hat verified version: ${recommendation}.`;

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
        startLine: startLine +  (ecosystem === 'maven' ? 2 : 1),
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

    results.push(result);
    console.log(`*******fetching Recommended results ${JSON.stringify(result)} ********* `)

    const fetchedRules = fetchRecomendationRules(recommendation, ruleId);

    rules.push(fetchedRules);

    return [ results, rules ];

}