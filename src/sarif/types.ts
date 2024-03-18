
export interface RhdaData {
    providers: Map<string, RhdaProvider>
}

export interface RhdaProvider {
    sources: Map<string, RhdaSource>,
}

export interface RhdaSource {
    dependencies: RhdaDependency[],
}

export interface RhdaDependency {
    ref: string,
    issues: RhdaIssues[] | null,
    transitive: RhdaDependency[] | null,
    recommendation: string | null,
}

export interface RhdaIssues {
    id: string,
    title: string,
    severity: string,
    cves: string[],
    cvss: RhdaCVSS,
    remediation: RhdaRemediation,
}

export interface RhdaCVSS {
    cvss: string,
}

export interface RhdaRemediation {
    trustedContent: RhdaTrustedContent | null,
    fixedIn: string[],
}

export interface RhdaTrustedContent {
    ref: string,
}
