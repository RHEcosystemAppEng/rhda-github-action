import * as sarif from "sarif";
import * as fs from "fs";
import path from 'path';

import * as types from './types.js';
import { fetchRules } from './rules.js';

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

    rhdaDependency: types.RhdaDependency,
    manifestFilePath: string,
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {
    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];
    const manifestData = fs.readFileSync(manifestFilePath, "utf-8");
    const lines = manifestData.split(/\r\n|\n/);
    const dependencyRef: string = rhdaDependency.ref;

    let resolvedDependencyref = resolveDependencyFromReference(dependencyRef);
    let dependencyVersion = resolveVersionFromReference(dependencyRef);
    let ecosystem = resolveEcosystemFromReference(dependencyRef);
    let dependencyName = resolvedDependencyref.split('@')[0];
    dependencyName = ecosystem === 'maven' ? dependencyName.split('/')[1] : dependencyName;

    const startLine = lines.findIndex((line) => {
        return line.includes(ecosystem === 'maven' ? `<artifactId>${dependencyName}</artifactId>` : dependencyName);
    });
    
    if (rhdaDependency.issues) {
        
        const fetchedResults = fetchResults(
            rhdaDependency.issues,
            manifestFilePath, 
            startLine, 
            dependencyName,
            dependencyVersion,
            ecosystem
        );

        results.push(...fetchedResults[0]);
        rules.push(...fetchedResults[1]);
    }   

    return [ results, rules ];
}

function fetchResults(
    /*
    * creates one single result
    */

    rhdaIssues: types.RhdaIssues[],
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

        const fetchedRules = fetchRules(issue);

        rules.push(fetchedRules);

    });

    return [ results, rules ];

}