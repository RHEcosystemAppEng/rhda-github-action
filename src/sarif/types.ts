
const GO_MOD = 'go.mod';
const POM_XML = 'pom.xml';
const PACKAGE_JSON = 'package.json';
const REQUIREMENTS_TXT = 'requirements.txt';
const BUILD_GRADLE = 'build.gradle';

export const GRADLE = 'gradle';
export const MAVEN = 'maven';
const GOLANG = 'golang';
const NPM = 'npm';
const PYPI = 'pypi';

export const fileNameToEcosystemMappings: { [key: string]: string } = {
    [BUILD_GRADLE]: GRADLE,
    [POM_XML]: MAVEN,
    [GO_MOD]: GOLANG,
    [PACKAGE_JSON]: NPM,
    [REQUIREMENTS_TXT]: PYPI
};

/**
 * Represents data specification related to a dependency.
 */
export interface IDependencyData {
    ref: string;
    depGroup: string;
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