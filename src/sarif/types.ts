
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



//----------------------------------

/**
 * Represents data specification related to a dependency.
 */
export interface IDependencyData {
    ref: string;
    depName: string;
    depVersion: string;
    ecosystem: string;
    providerId: string;
    sourceId: string;
    issues: IIssue[] | null;
    transitives: IDependencyData[] | null;
    recommendationRef: string | '';
}

/**
 * Represents a source object with an ID and dependencies array.
 */
export interface ISource {
    providerId: string;
    sourceId: string;
    summary: ISummary | null;
    dependencies: any[];
}

export interface ISummary {
    critical: number | 0;
    high: number | 0;
    medium: number | 0;
    low: number | 0;
}

export interface IIssue {
    id: string;
    title: string;
    severity: string;
    cves: string[];
    cvss: ICVSS;
    remediation: IRemediation;
}

export interface ICVSS {
    cvss: string;
}

export interface IRemediation {
    trustedContent: ITrustedContent | null;
}

export interface ITrustedContent {
    ref: string;
}

export type VulnerabilitySeverity = "none" | "warning" | "error";