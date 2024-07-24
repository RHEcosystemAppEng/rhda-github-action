/**
 * Represents data specification related to a dependency.
 */
export interface IDependencyData {
    imageRef: string | undefined;
    depRef: string;
    depGroup: string | undefined;
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
 * Represents a source object.
 */
export interface ISource {
    providerId: string;
    sourceId: string;
    summary: ISummary | null;
    dependencies: any[] | null;
}

/**
 * Represents a summary object with severity counts.
 */
export interface ISummary {
    critical: number | 0;
    high: number | 0;
    medium: number | 0;
    low: number | 0;
}

/**
 * Represents an issue related to a dependency.
 */
export interface IIssue {
    id: string;
    title: string;
    severity: string;
    cves: string[] | null;
    cvss: ICVSS | null;
    remediation: IRemediation;
}

/**
 * Represents Common Vulnerability Scoring System (CVSS) details.
 */
export interface ICVSS {
    cvss: string;
}

/**
 * Represents remediation details for an issue.
 */
export interface IRemediation {
    trustedContent: ITrustedContent | null;
}

/**
 * Represents trusted content reference for remediation.
 */
export interface ITrustedContent {
    ref: string;
}
