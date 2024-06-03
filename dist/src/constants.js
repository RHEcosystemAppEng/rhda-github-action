export const UTM_SOURCE = 'github-actions';
export const SARIF_SCHEMA_URL = "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json";
export const SARIF_SCHEMA_VERSION = "2.1.0";
export const DEFAULT_MANIFEST_DIR = ".";
const GO_MOD = 'go.mod';
const POM_XML = 'pom.xml';
const PACKAGE_JSON = 'package.json';
const REQUIREMENTS_TXT = 'requirements.txt';
const BUILD_GRADLE = 'build.gradle';
const DOCKERFILE = 'Dockerfile';
const CONTAINERFILE = 'Containerfile';
export const GRADLE = 'gradle';
export const MAVEN = 'maven';
const GOLANG = 'golang';
const NPM = 'npm';
const PYPI = 'pypi';
export const DOCKER = 'docker';
export const fileNameToEcosystemMappings = {
    [BUILD_GRADLE]: GRADLE,
    [POM_XML]: MAVEN,
    [GO_MOD]: GOLANG,
    [PACKAGE_JSON]: NPM,
    [REQUIREMENTS_TXT]: PYPI,
    [DOCKERFILE]: DOCKER,
    [CONTAINERFILE]: DOCKER
};
export const vulnerabilitySeverityOrder = {
    none: 0,
    warning: 1,
    error: 2
};
//# sourceMappingURL=constants.js.map