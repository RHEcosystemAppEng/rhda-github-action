import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import * as utils from './utils/utils'
import { Inputs, Outputs } from './generated/inputs-outputs';
import { resolveManifestFilePath } from './ManifestHandler';

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

  const resolvedManifestFilePath = await resolveManifestFilePath(manifestFilePathInput);

}

run()
.then()
.catch()
.finally()