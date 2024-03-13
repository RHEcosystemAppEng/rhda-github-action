import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import * as utils from './utils/utils.js'
import { Inputs, Outputs } from './generated/inputs-outputs.js';
import { resolveManifestFilePath } from './manifestHandler.js';
import { stackAnalysisService } from './exhortServices.js';

async function run(): Promise<void> {

  let sha;
  let ref;

  sha = await utils.getEnvVar("GITHUB_SHA");
  ref = utils.getEnvVar("GITHUB_REF");

  ghCore.info(`Ref to analyze is "${ref}"`);
  ghCore.info(`Commit to analyze is "${sha}"`);

  /* Install dependencies */

  const manifestFilePathInput = ghCore.getInput(Inputs.MANIFEST_FILE_PATH);
  if (manifestFilePathInput) {
      ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" is "${manifestFilePathInput}"`);
  }

  const manifestData = await resolveManifestFilePath(manifestFilePathInput);

  // set up configuration options for the stack analysis request
  const options = {
    // 'RHDA_TOKEN': globalConfig.telemetryId,
    'RHDA_SOURCE': 'github-actions',
    // 'MATCH_MANIFEST_VERSIONS': globalConfig.matchManifestVersions,
    'EXHORT_MVN_PATH': ghCore.getInput(Inputs.MVN_EXECUTABLE_PATH),
    'EXHORT_NPM_PATH': ghCore.getInput(Inputs.NPM_EXECUTABLE_PATH),
    'EXHORT_GO_PATH': ghCore.getInput(Inputs.GO_EXECUTABLE_PATH),
    'EXHORT_PYTHON3_PATH': ghCore.getInput(Inputs.PYTHON3_EXECUTABLE_PATH),
    'EXHORT_PIP3_PATH': ghCore.getInput(Inputs.PIP3_EXECUTABLE_PATH),
    'EXHORT_PYTHON_PATH': ghCore.getInput(Inputs.PYTHON_EXECUTABLE_PATH),
    'EXHORT_PIP_PATH': ghCore.getInput(Inputs.PIP_EXECUTABLE_PATH),
    // 'EXHORT_SNYK_TOKEN': globalConfig.exhortPipPath
  };

  await stackAnalysisService(manifestData.filePath, options)
  .then( result => {
    console.log("RHDA working")
  })
  .catch(error => {
    console.log(`RHDA not working, Error: ${error.message}`)
  })

}

run()
.then()
.catch()
.finally()