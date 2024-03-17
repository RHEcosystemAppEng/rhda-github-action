import * as ghCore from '@actions/core';
import * as github from '@actions/github';
import path from 'path';

import * as utils from './utils/utils.js'
import { resolveManifestFilePath } from './manifestHandler.js';
import { generateRHDAReport } from './rhda.js';
import { Inputs, Outputs } from './generated/inputs-outputs.js';
import { generateArtifacts } from './artifactHandler.js';

async function run(): Promise<void> {

  let sha;
  let ref;

  sha = await utils.getEnvVar("GITHUB_SHA");
  ref = utils.getEnvVar("GITHUB_REF");

  ghCore.info(`Ref to analyze is "${ref}"`);
  ghCore.info(`Commit to analyze is "${sha}"`);

  /* Generated RHDA report */

  const manifestFilePath = await resolveManifestFilePath();

  const report = await generateRHDAReport(manifestFilePath);

  /* Save RHDA report to file */

  const reportFilePath = path.resolve(".", `${ghCore.getInput(Inputs.RHDA_REPORT_NAME)}.json`);
  await utils.writeReportToFile(JSON.stringify(report,null,4), reportFilePath);
  
  ghCore.setOutput(Outputs.RHDA_REPORT_JSON, report);

  // console.log(stackAnalysisReportJson['scanned']['direct']);

  /* Convert to SARIF and upload SARIF */

  /* Label the PR with the scan status, if applicable */

  /* Handle artifacts */

  await generateArtifacts([reportFilePath]);

  // output var(V) + savedfile(V) + upload SARIF + artifact(V).

}

run()