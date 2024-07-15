# Red Hat Dependency Analytics (RHDA)

[![CI Checks](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/ci.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/ci.yaml)
<br>
<br>
[![Scan Maven project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_maven.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_maven.yaml)
[![Scan Gradle project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_gradle.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_gradle.yaml)
[![Scan Npm project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_npm.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_npm.yaml)
[![Scan Golang project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_go.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_go.yaml)
[![Scan Python project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_python.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_python.yaml)
[![Scan Docker project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_docker.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_docker.yaml)
[![Scan Podman project](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_podman.yaml/badge.svg)](https://github.com/RHEcosystemAppEng/rhda-github-action/actions/workflows/scan_podman.yaml)
<br>
<br>
[![tag badge](https://img.shields.io/github/v/tag/RHEcosystemAppEng/rhda-github-action)](https://github.com/RHEcosystemAppEng/rhda-github-action/tags)
[![license badge](https://img.shields.io/github/license/RHEcosystemAppEng/rhda-github-action)](./LICENSE)
[![size badge](https://img.shields.io/github/size/RHEcosystemAppEng/rhda-github-action/dist/index.js)](./dist)

The **RHDA** Github Action provides you with awareness to security concerns within the code sumited to your github code repository. The Red Hat Dependency Analytics platform uses vulnerability data sources to report the most up-to-date vulnerability information available.

The RHDA report is uploaded to the GitHub repository as an artifact and as a [SARIF](https://sarifweb.azurewebsites.net/) file, and vulnerabilities found are reported to repository maintainers in the **Security** tab.

## What is Supported

| Ecosystem | Required Binaries and Prerequisites | Supported Manifests / Files |
| --------- | ----------------------------------- | --------------------------- |
| <a href="https://www.java.com/">Java</a> - <a href="https://maven.apache.org/">Maven</a> | `mvn` | pom.xml |
| <a href="https://gradle.org//">Gradle</a> - <a href="https://gradle.org/install//">Gradle Installation</a> | `gradle` | build.gradle |
| <a href="https://www.javascript.com//">JavaScript</a> - <a href="https://www.npmjs.com//">Npm</a> | `npm` | package.json |
| <a href="https://go.dev//">Golang</a> - <a href="https://go.dev/blog/using-go-modules//">Go Modules</a> | `go` | go.mod |
| <a href="https://go.dev//">Python</a> - <a href="https://pypi.org/project/pip//">pip Installer</a> | `pip` | requirements.txt |
| [docker](https://docs.docker.com/get-docker/) | [`syft`](https://github.com/anchore/syft?tab=readme-ov-file#installation), [`skopeo`](https://github.com/containers/skopeo/blob/main/install.md) , Java version 20 or later | Dockerfile |
| [Podman](https://podman.io/docs/installation) | [`syft`](https://github.com/anchore/syft?tab=readme-ov-file#installation), [`skopeo`](https://github.com/containers/skopeo/blob/main/install.md) , Java version 20 or later | Containerfile |

In future releases, Red Hat plans to support other programming languages.

## Configuration

You can refer to [the examples in this repository](./.github/workflows) for a simple example of scanning each supported language. Or, skip to the [example below](#example).

### 1. Set up the tool stack
Unless already done, you must set up the tool stack for your project depending on the ecosystem you wish to analyse.

Refer to the setup actions for:
  - [Go](https://github.com/actions/setup-go)
  - [Java](https://github.com/actions/setup-java)
  - [Node.js](https://github.com/actions/setup-node)
  - [Python](https://github.com/actions/setup-python)

`syft` and `skopeo` can ge set up using script:
```yaml
- name: Setup syft
  run: |
    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
```
```yaml
- name: Setup skopeo
  run: |
    sudo apt-get -y update
    sudo apt-get -y install skopeo
```

### 2. Set up RHDA scan
Install RHDA from the [**RHEcosystemAppEng/rhda-github-action**](https://github.com/RHEcosystemAppEng/rhda-github-action) GitHub repository.

```yaml
- name: RHDA Scan
  id: rhda_scan
  uses: RHEcosystemAppEng/rhda-github-action@main
```

## Example

The example workflow job below shows how the **RHDA** action can be used to scan vulnerabilities in a Node.js project and upload the result to GitHub.

```yaml
steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20
    
    - name: RHDA Scan
      id: rhda_scan
      uses: RHEcosystemAppEng/rhda-github-action@main
```
The following snapshot is an example of a RHDA run on a Node.js project.

![Workflow run](./images/workflow_run.png)

## Action Inputs

| Input | Description | Default |
| ----- | ----------- | --------- |
| manifest_directory | Path to the directory containing the manifest_file. | 
| manifest_file | Name (basename) of the manifest file to analyze. This file must exist in the manifest_directory. | 
| rhda_report_name | Name of the file where the Red Hat Dependency Analytics report will be saved. | `redhat-dependency-analytics-report`
| github_token | Github token to upload SARIF file to the GitHub | [`${{ github.token }}`](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#about-the-github_token-secret) <!-- markdown-link-check-disable-line -->
| upload_sarif | Upload the generated SARIF file, by default it is set to "true". If you don't want to upload SARIF file set this input to "false". | `true`
| upload_artifact | Upload the generated RHDA report JSON file and SARIF file as an artifact. | `true`
| artifact_filename | File name of the artifact to upload. By default it is named as 'redhat-dependency-analytics-report' | `redhat-dependency-analytics-report`
| fail_on | Fail the workflow if vulnerability is found in the project. To set failure when vulnerability severity level is either "error" or "warning" set this input to "warning". By default it is set to fail when severity level is "error", or if you don't want to fail the action set this input to "never" | `error`
| use_python_virtual_environment | Automates the installation of missing packages in a Python virtual environment when set to true. | `false`
| use_go_mvs | Use the Minimal Version Selection (MVS) algorithm to select a set of module versions to use when building Go packages. | `false`
| enable_python_best_efforts_installation | Installs Python packages tailored to the Python version in use, disregarding declared versions. Note: Requires settings Match Manifest Versions to be set to false and Use Python Virtual Environment to be set to true. | `false`
| use_pip_dep_tree | Use lightweight pipdeptree command line tool as the data source for building the Python dependency tree. This may significantly enhance analysis time. | `false`
| match_manifest_version | Restricts RHDA from performing analysis on dependency tags that do not match the tags requested within the manifest files. |  `false`
| mvn_executable_path | Specifies absolute path of mvn executable. | `mvn` 
| gradle_executable_path | Specifies absolute path of gradle executable. | `gradle`
| npm_executable_path | Specifies absolute path of npm executable. | `npm`
| go_executable_path | Specifies absolute path of go executable. | `go`
| python3_executable_path | Specifies absolute path of python3 executable, python3 takes precedence over python. | `python3`
| pip3_executable_path | Specifies absolute path of pip3 executable, pip3 takes precedence over pip. | `pip3`
| python_executable_path | Specifies absolute path of python executable, python3 takes precedence over python. | `python`
| pip_executable_path | Specifies absolute path of pip executable, pip3 takes precedence over pip. | `pip`
| syft_executable_path | Specifies absolute path of syft executable. | `syft`
| syft_config_path | Specifies absolute path to the syft configuration file. | 
| skopeo_executable_path | Specifies absolute path of skopeo executable. | `skopeo`
| skopeo_config_path | Specifies absolute path to the authentication file used by 'skopeo inspect'. | 
| docker_executable_path | Specifies absolute path of docker executable. | `docker`
| podman_executable_path | Specifies absolute path of podman executable. | `podman`
| image_platform | Specifies platform used for multi-arch images. |

## Action Outputs

- **rhda_report_json**: Path to generated Red Hat Dependency Analytics Report in JSON format.
- **rhda_report_sarif**: Path to generated Red Hat Dependency Analytics Report in SARIF format.
- **artifact_id**: ID of the uploaded artifact.

## Scanning Pull Requests

This action can run RHDA scans on pull requests. Because the action must check out the pull request's code in order to scan it, the [`pull_request_target` trigger](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request_target) must be used. <!-- markdown-link-check-disable-line -->

After the RHDA scan is approved and the workflow runs, a label indicating the scan result will be added to the pull request.

The following snapshot shows vulnerability details in the GitHub UI for a pull request.

![PR vulnerability details](./images/vul_details.png)

Use the following snippet to enable pull request scans in your repository:
``` yaml
on:
  pull_request_target:
    # These types are all required for RHDA to scan pull requests correctly and securely.
    types: [ opened, synchronize, reopened, labeled, edited ]
```
