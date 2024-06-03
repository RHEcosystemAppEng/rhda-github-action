export function fetchIssueRules(issueData, directRef) {
    const id = issueData.id;
    let sev = "none";
    if (issueData.severity === "LOW" || issueData.severity === "MEDIUM") {
        sev = "warning";
    }
    if (issueData.severity === "HIGH" || issueData.severity === "CRITICAL") {
        sev = "error";
    }
    const help = {
        text: `Introduced through ${directRef}`,
    };
    const shortDescription = {
        text: `${issueData.severity} severity - ${issueData.title} vulnerability`,
    };
    const defaultConfiguration = {
        level: sev,
    };
    let fullDescription = undefined;
    let properties = undefined;
    if (issueData.cves && issueData.cvss) {
        fullDescription = {
            text: `${issueData.cves.join(", ")}`,
        };
        properties = {
            tags: ["security", ...issueData.cves, `cvss:${issueData.cvss.cvss}`],
        };
    }
    const rule = {
        id,
        shortDescription,
        fullDescription,
        defaultConfiguration,
        properties,
        help
    };
    return rule;
}
export function fetchRecomendationRules(recommendation) {
    let id = recommendation;
    let sev = "note";
    const shortDescription = {
        text: `Red Hat recommendation`
    };
    const defaultConfiguration = {
        level: sev,
    };
    const rule = {
        id,
        shortDescription,
        defaultConfiguration,
    };
    return rule;
}
//# sourceMappingURL=rules.js.map