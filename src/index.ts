import * as ghCore from '@actions/core';
import * as github from '@actions/github';
import path from 'path';

import * as utils from './utils/utils.js'
import { resolveManifestFilePath } from './manifestHandler.js';
import { generateRHDAReport } from './rhda.js';
import { Inputs, Outputs } from './generated/inputs-outputs.js';
import { generateArtifacts } from './artifactHandler.js';
import { handleSarif } from './sarif/handler.js';

async function run(): Promise<void> {

  ghCore.info(`Working directory is ${process.cwd()}`);

  ghCore.debug(`Runner OS is ${utils.getOS()}`);
  ghCore.debug(`Node version is ${process.version}`);

  const prRawData = github.context.payload.pull_request;
  console.log(`this is the prRawData\n: ${JSON.stringify(prRawData)}`);
  return;

  const analysisStartTime = new Date().toISOString();
  ghCore.debug(`Analysis started at ${analysisStartTime}`);

  let sha;
  let ref;

  sha = await utils.getEnvVar("GITHUB_SHA");
  ref = utils.getEnvVar("GITHUB_REF");

  ghCore.info(`Ref to analyze is "${ref}"`);
  ghCore.info(`Commit to analyze is "${sha}"`);

  /* Generated RHDA report */

  const manifestFilePath: string = await resolveManifestFilePath();

  const rhdaReportJson: any = await generateRHDAReport(manifestFilePath);

  /* Save RHDA report to file */

  const rhdaReportJsonFilePath: string = path.resolve(".", `${ghCore.getInput(Inputs.RHDA_REPORT_NAME)}.json`);
  await utils.writeToFile(JSON.stringify(rhdaReportJson,null,4), rhdaReportJsonFilePath);
  
  ghCore.info(`✍️ Setting output "${Outputs.RHDA_REPORT_JSON}" to ${rhdaReportJsonFilePath}`);
  ghCore.setOutput(Outputs.RHDA_REPORT_JSON, rhdaReportJson);

  /* Convert to SARIF and upload SARIF */

  const rhdaReportSarifFilePath: string = await handleSarif(rhdaReportJson, manifestFilePath, sha, ref, analysisStartTime);

  /* Label the PR with the scan status, if applicable */

  /* Handle artifacts */

  await generateArtifacts([rhdaReportJsonFilePath, rhdaReportSarifFilePath]);

}

run()