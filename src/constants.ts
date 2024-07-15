// Source of UTM for telemetry.
export const UTM_SOURCE = 'github-actions';

// URL of the SARIF schema.
export const SARIF_SCHEMA_URL =
    'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json';

// Version of the SARIF schema.
export const SARIF_SCHEMA_VERSION = '2.1.0';

// Supported manifests and files
const GO_MOD = 'go.mod';
const POM_XML = 'pom.xml';
const PACKAGE_JSON = 'package.json';
const REQUIREMENTS_TXT = 'requirements.txt';
const BUILD_GRADLE = 'build.gradle';
const DOCKERFILE = 'Dockerfile';
const CONTAINERFILE = 'Containerfile';

// Supported ecosystems
export const GRADLE = 'gradle';
export const MAVEN = 'maven';
const GOLANG = 'golang';
const NPM = 'npm';
const PYPI = 'pypi';
export const DOCKER = 'docker';

// Mapping of file names to their corresponding ecosystems.
export const fileNameToEcosystemMappings: { [key: string]: string } = {
    [BUILD_GRADLE]: GRADLE,
    [POM_XML]: MAVEN,
    [GO_MOD]: GOLANG,
    [PACKAGE_JSON]: NPM,
    [REQUIREMENTS_TXT]: PYPI,
    [DOCKERFILE]: DOCKER,
    [CONTAINERFILE]: DOCKER,
};

// Type representing the severity of vulnerabilities.
export type VulnerabilitySeverity = 'none' | 'warning' | 'error';

// Order of vulnerability severities for comparison purposes.
export const vulnerabilitySeverityOrder: Record<VulnerabilitySeverity, number> =
    {
        none: 0,
        warning: 1,
        error: 2,
    };
