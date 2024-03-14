import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import * as utils from './utils/utils.js'
import { resolveManifestFilePath } from './manifestHandler.js';
import { generateRHDAReport } from './stackAnalysis.js';

async function run(): Promise<void> {

  let sha;
  let ref;

  sha = await utils.getEnvVar("GITHUB_SHA");
  ref = utils.getEnvVar("GITHUB_REF");

  ghCore.info(`Ref to analyze is "${ref}"`);
  ghCore.info(`Commit to analyze is "${sha}"`);

  const manifestFilePath = await resolveManifestFilePath();

  const stackAnalysisReportJson = await generateRHDAReport(manifestFilePath);

  console.log(stackAnalysisReportJson['scanned']['direct']);


}

run()
.then()
.catch()
.finally()