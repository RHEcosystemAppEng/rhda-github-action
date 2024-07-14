import * as sarif from 'sarif';

import * as types from './types.js';

/**
 * Converts issue data into a SARIF ReportingDescriptor (rule) object.
 * @param issueData - The issue data to convert.
 * @param directRef - The direct reference associated with the issue (dependency or image).
 * @returns A SARIF ReportingDescriptor (rule) representing the issue.
 */
export function fetchIssueRules(
    issueData: types.IIssue,
    directRef: string,
): sarif.ReportingDescriptor {
    const id = issueData.id;

    let sev: sarif.ReportingConfiguration.level = 'none';
    if (issueData.severity === 'LOW' || issueData.severity === 'MEDIUM') {
        sev = 'warning';
    }
    if (issueData.severity === 'HIGH' || issueData.severity === 'CRITICAL') {
        sev = 'error';
    }

    const help: sarif.MultiformatMessageString = {
        text: `Introduced through ${directRef}`,
    };

    const shortDescription: sarif.MultiformatMessageString = {
        text: `${issueData.severity} severity - ${issueData.title} vulnerability`,
    };

    const defaultConfiguration = {
        level: sev,
    };

    let fullDescription: sarif.MultiformatMessageString = undefined;
    let properties: sarif.PropertyBag = undefined;
    if(issueData.cves && issueData.cves.length > 0 ) {
        fullDescription = {
            text: `${issueData.cves.join(', ')}`,
        };

        properties = {
            tags: [
                'security',
                ...issueData.cves
            ],
        };
    }
    if (issueData.cvss) {
        if (properties) {
            properties.tags.push(`cvss:${issueData.cvss.cvss}`) 
        } else {
            properties = {
                tags: [
                    'security',
                    `cvss:${issueData.cvss.cvss}`
                ],
            }; 
        }
    }

    const rule: sarif.ReportingDescriptor = {
        id,
        shortDescription,
        fullDescription,
        defaultConfiguration,
        properties,
        help,
    };

    return rule;
}

/**
 * Converts a recommendation into a SARIF ReportingDescriptor (rule) object.
 * @param recommendation - The recommendation to convert.
 * @returns A SARIF ReportingDescriptor (rule) representing the recommendation.
 */
export function fetchRecomendationRules(
    recommendation: string,
): sarif.ReportingDescriptor {
    const id = recommendation;

    const sev: sarif.ReportingConfiguration.level = 'note';

    const shortDescription: sarif.MultiformatMessageString = {
        text: `Red Hat recommendation`,
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
