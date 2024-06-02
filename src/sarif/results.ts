import * as sarif from "sarif";
import path from 'path';

import * as types from './types.js';
import { fetchIssueRules, fetchRecomendationRules } from './rules.js';
import { resolveDependencyFromReference, resolveVersionFromReference } from './convert.js';
import { MAVEN } from "../constants.js";

export function rhdaToResult(
    rhdaDependency: types.IDependencyData,
    manifestFilePath: string,
    startLine: number,
    refHasIssues: boolean,
): [ sarif.Result[], sarif.ReportingDescriptor[] ] {

    const results: sarif.Result[] = [];
    const rules: sarif.ReportingDescriptor[] = [];

    const generateIssueResults = (issues: types.IIssue[], dependencyData: types.IDependencyData,isDirect: boolean) => {
        issues.forEach((issue) => {
            let textMessage = `This line introduces a "${issue.title}" vulnerability with `
                + `${issue.severity} severity.\n`
                + `Vulnerability data provider is ${dependencyData.providerId}.\n`
                + `Vulnerability data source is ${dependencyData.sourceId}.\n`
                + `Vulnerable${isDirect ? '' : ' transitive'} dependency is ${dependencyData.depGroup ? `${dependencyData.depGroup}/` : ''}${dependencyData.depName} version ${dependencyData.depVersion}.`;

            if (issue.remediation.trustedContent) {
                textMessage = `${textMessage}\nRecommended remediation version: ${resolveVersionFromReference(issue.remediation.trustedContent.ref)}`;
            }

            const result = fetchResult(
                issue.id,
                textMessage,
                manifestFilePath,
                startLine,
            )

            const rule = fetchIssueRules(issue, resolveDependencyFromReference(rhdaDependency.ref));

            rules.push(rule);
            results.push(result);
        });
    }
    
    if (refHasIssues) {
        if (rhdaDependency.issues && rhdaDependency.issues.length > 0) {
            generateIssueResults(rhdaDependency.issues, rhdaDependency, true);
        }

        if (rhdaDependency.transitives && rhdaDependency.transitives.length > 0) {
            rhdaDependency.transitives.forEach((td: types.IDependencyData) => {
                if (td.issues && td.issues.length > 0) {
                    generateIssueResults(td.issues, td, false);
                }
            })
        }

    }  else if (!refHasIssues && rhdaDependency.recommendationRef) {

        let textMessage = `Recommended Red Hat verified version: ${rhdaDependency.recommendationRef}.`;

        const result = fetchResult(
            rhdaDependency.recommendationRef,
            textMessage,
            manifestFilePath,
            startLine,
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