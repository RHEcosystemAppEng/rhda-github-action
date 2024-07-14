// This file was auto-generated by action-io-generator. Do not edit by hand!
export enum Inputs {
    /**
     * File name of the artifact to upload.
     * By default it is named as 'redhat-dependency-analytics-report'
     * Required: false
     * Default: "redhat-dependency-analytics-report"
     */
    ARTIFACT_FILENAME = "artifact_filename",
    /**
     * Specifies absolute path of docker executable.
     * Required: false
     * Default: "docker"
     */
    DOCKER_EXECUTABLE_PATH = "docker_executable_path",
    /**
     * Installs Python packages tailored to the Python version in use, disregarding declared versions. Note: Requires settings Match Manifest Versions to be set to false and Use Python Virtual Environment to be set to true.
     * Required: false
     * Default: "false"
     */
    ENABLE_PYTHON_BEST_EFFORTS_INSTALLATION = "enable_python_best_efforts_installation",
    /**
     * Fail the workflow if vulnerability is found in the project.
     * To set failure when vulnerability severity level is either "error" or "warning" set this input to "warning".
     * By default it is set to fail when severity level is "error",
     * or if you don't want to fail the action set this input to "never"
     * Required: false
     * Default: "error"
     */
    FAIL_ON = "fail_on",
    /**
     * Github token to upload SARIF file to the GitHub
     * Required: false
     * Default: "${{ github.token }}"
     */
    GITHUB_TOKEN = "github_token",
    /**
     * Specifies absolute path of go executable.
     * Required: false
     * Default: "go"
     */
    GO_EXECUTABLE_PATH = "go_executable_path",
    /**
     * Specifies absolute path of gradle executable.
     * Required: false
     * Default: "gradle"
     */
    GRADLE_EXECUTABLE_PATH = "gradle_executable_path",
    /**
     * Specifies platform used for multi-arch images.
     * Required: false
     * Default: ""
     */
    IMAGE_PLATFORM = "image_platform",
    /**
     * Path to the directory containing the manifest_file.
     * Required: false
     * Default: None.
     */
    MANIFEST_DIRECTORY = "manifest_directory",
    /**
     * Name (basename) of the manifest file to analyze. This file must exist in the manifest_directory.
     * Required: false
     * Default: None.
     */
    MANIFEST_FILE = "manifest_file",
    /**
     * Restricts RHDA from performing analysis on dependency tags that do not match the tags requested within the manifest files.
     * Required: true
     * Default: "false"
     */
    MATCH_MANIFEST_VERSION = "match_manifest_version",
    /**
     * Specifies absolute path of mvn executable.
     * Required: false
     * Default: "mvn"
     */
    MVN_EXECUTABLE_PATH = "mvn_executable_path",
    /**
     * Specifies absolute path of npm executable.
     * Required: false
     * Default: "npm"
     */
    NPM_EXECUTABLE_PATH = "npm_executable_path",
    /**
     * Specifies absolute path of pip3 executable, pip3 takes precedence over pip.
     * Required: false
     * Default: "pip3"
     */
    PIP3_EXECUTABLE_PATH = "pip3_executable_path",
    /**
     * Specifies absolute path of pip executable, pip3 takes precedence over pip.
     * Required: false
     * Default: "pip"
     */
    PIP_EXECUTABLE_PATH = "pip_executable_path",
    /**
     * Specifies absolute path of podman executable.
     * Required: false
     * Default: "podman"
     */
    PODMAN_EXECUTABLE_PATH = "podman_executable_path",
    /**
     * Specifies absolute path of python3 executable, python3 takes precedence over python.
     * Required: false
     * Default: "python3"
     */
    PYTHON3_EXECUTABLE_PATH = "python3_executable_path",
    /**
     * Specifies absolute path of python executable, python3 takes precedence over python.
     * Required: false
     * Default: "python"
     */
    PYTHON_EXECUTABLE_PATH = "python_executable_path",
    /**
     * Name of the file where the Red Hat Dependency Analytics report will be saved.
     * Required: false
     * Default: "redhat-dependency-analytics-report"
     */
    RHDA_REPORT_NAME = "rhda_report_name",
    /**
     * Specifies absolute path to the authentication file used by 'skopeo inspect'.
     * Required: false
     * Default: ""
     */
    SKOPEO_CONFIG_PATH = "skopeo_config_path",
    /**
     * Specifies absolute path of skopeo executable.
     * Required: false
     * Default: "skopeo"
     */
    SKOPEO_EXECUTABLE_PATH = "skopeo_executable_path",
    /**
     * Specifies absolute path to the syft configuration file.
     * Required: false
     * Default: ""
     */
    SYFT_CONFIG_PATH = "syft_config_path",
    /**
     * Specifies absolute path of syft executable.
     * Required: false
     * Default: "syft"
     */
    SYFT_EXECUTABLE_PATH = "syft_executable_path",
    /**
     * Upload the generated RHDA report JSON file and SARIF file as an artifact.
     * Required: false
     * Default: "true"
     */
    UPLOAD_ARTIFACT = "upload_artifact",
    /**
     * Upload the generated SARIF file, by default it is set to "true".
     * If you don't want to upload SARIF file set this input to "false".
     * Required: false
     * Default: "true"
     */
    UPLOAD_SARIF = "upload_sarif",
    /**
     * Use the Minimal Version Selection (MVS) algorithm to select a set of module versions to use when building Go packages.
     * Required: false
     * Default: "false"
     */
    USE_GO_MVS = "use_go_mvs",
    /**
     * Use lightweight pipdeptree command line tool as the data source for building the Python dependency tree. This may significantly enhance analysis time.
     * Required: false
     * Default: "false"
     */
    USE_PIP_DEP_TREE = "use_pip_dep_tree",
    /**
     * Automates the installation of missing packages in a Python virtual environment when set to true.
     * Required: false
     * Default: "false"
     */
    USE_PYTHON_VIRTUAL_ENVIRONMENT = "use_python_virtual_environment",
}

export enum Outputs {
    /**
     * ID of the uploaded artifact.
     * Required: false
     * Default: None.
     */
    ARTIFACT_ID = "artifact_id",
    /**
     * Path to generated Red Hat Dependency Analytics Report in JSON format.
     * Required: false
     * Default: None.
     */
    RHDA_REPORT_JSON = "rhda_report_json",
    /**
     * Path to generated Red Hat Dependency Analytics Report in SARIF format.
     * Required: false
     * Default: None.
     */
    RHDA_REPORT_SARIF = "rhda_report_sarif",
}
