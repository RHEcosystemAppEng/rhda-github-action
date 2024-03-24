import * as sarif from "sarif";

import * as types from './types.js';

export function fetchIssueRules(
    issueData: types.IIssue
): sarif.ReportingDescriptor {
    const id = issueData.id;

    let sev: sarif.ReportingConfiguration.level = "none";
    if (issueData.severity === "LOW" || issueData.severity === "MEDIUM") {
        sev = "warning";
    }
    if (issueData.severity === "HIGH" || issueData.severity === "CRITICAL") {
        sev = "error";
    }

    const shortDescription: sarif.MultiformatMessageString = {
        text: `${issueData.severity} severity - ${issueData.title} vulnerability`,
    };

    const defaultConfiguration = {
        level: sev,
    };
    
    let fullDescription: sarif.MultiformatMessageString = undefined;
    let properties: sarif.PropertyBag = undefined;
    if (issueData.cves && issueData.cvss) {
        fullDescription = {
            text: `${issueData.cves.join(", ")}`,
        };

        properties = {
            tags: [ "security", ...issueData.cves, `cvss:${issueData.cvss.cvss}` ],
        };
    }

    const rule: sarif.ReportingDescriptor = {
        id,
        shortDescription,
        fullDescription,
        defaultConfiguration,
        properties,
    };

    return rule;
}

export function fetchRecomendationRules(
    recommendation: string,
): sarif.ReportingDescriptor {

    let id = recommendation

    let sev: sarif.ReportingConfiguration.level = "note";

    const shortDescription: sarif.MultiformatMessageString = {
        text: `Recommendation`
    };

    const defaultConfiguration = {
        level: sev,
    };
    
    const rule: sarif.ReportingDescriptor = {
        id,
        shortDescription,
        defaultConfiguration,
    };

    return rule;
}