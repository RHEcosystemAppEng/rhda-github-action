import * as ghCore from '@actions/core';
import path from 'path';

import * as utils from './utils.js'
import { resolveManifestFilePath } from './manifestHandler.js';
import { generateRHDAReport } from './rhda.js';
import { Inputs, Outputs } from './generated/inputs-outputs.js';
import { generateArtifacts } from './artifactHandler.js';
import { handleSarif } from './sarif/handler.js';
import { isPr, handlePr } from './pr/handler.js';
import { getOriginalCheckoutBranch, checkoutCleanup } from './pr/checkout.js'
import { PrData } from './pr/types.js'
import { RhdaLabels, addLabelsToPr } from './pr/labels.js'


let prData: PrData | undefined;
let originalCheckoutBranch: string;
let sha;
let ref;

async function run(): Promise<void> {

  ghCore.info(`ℹ️ Working directory is ${process.cwd()}`);

  ghCore.debug(`Runner OS is ${utils.getOS()}`);
  ghCore.debug(`Node version is ${process.version}`);

  // checkout branch securly when payload originates from a pull request
  prData = await isPr();
  if (prData) {
    originalCheckoutBranch = await getOriginalCheckoutBranch();
    await handlePr(prData);
  }

  const analysisStartTime = new Date().toISOString();
  ghCore.debug(`Analysis started at ${analysisStartTime}`);

  if (prData) {
    ({ sha, ref } = prData);
  }
  else {
      sha = await utils.getCommitSha();
      ref = utils.getEnvVar("GITHUB_REF");
  }

  ghCore.info(`ℹ️ Ref to analyze is "${ref}"`);
  ghCore.info(`ℹ️ Commit to analyze is "${sha}"`);

  /* Generated RHDA report */

  const manifestFilePath: string = await resolveManifestFilePath();

  const rhdaReportJson: any = await generateRHDAReport(manifestFilePath);

  /* Save RHDA report to file */

  const rhdaReportJsonFilePath: string = path.resolve(".", `${ghCore.getInput(Inputs.RHDA_REPORT_NAME)}.json`);
  await utils.writeToFile(JSON.stringify(rhdaReportJson,null,4), rhdaReportJsonFilePath);
  
  ghCore.info(`✍️ Setting output "${Outputs.RHDA_REPORT_JSON}" to ${rhdaReportJsonFilePath}`);
  ghCore.setOutput(Outputs.RHDA_REPORT_JSON, rhdaReportJson);

  /* Convert to SARIF and upload SARIF */

  const {rhdaReportSarifFilePath, VulnerabilitySeverity: vulSeverity} = await handleSarif(rhdaReportJson, manifestFilePath, sha, ref, analysisStartTime, prData);

  /* Handle artifacts */

  await generateArtifacts([rhdaReportJsonFilePath, rhdaReportSarifFilePath]);

  /* Label the PR with the scan status, if applicable */

  if (prData) {
    let resultLabel: string;

    switch (vulSeverity) {
    case "error":
        resultLabel = RhdaLabels.RHDA_FOUND_ERROR;
        break;
    case "warning":
        resultLabel = RhdaLabels.RHDA_FOUND_WARNING;
        break;
    default:
        resultLabel = RhdaLabels.RHDA_SCAN_PASSED;
        break;
    }

    await addLabelsToPr(prData.number, [ resultLabel ]);
  }

  /* Evaluate fail_on and set the workflow step exit code accordingly */

  const failOn = ghCore.getInput(Inputs.FAIL_ON) || "error";

  if (vulSeverity !== "none") {
      if (failOn !== "never") {
          if (failOn === "warning") {
              ghCore.info(
                  `Input "${Inputs.FAIL_ON}" is "${failOn}", and at least one warning was found. Failing workflow.`
              );
              ghCore.setFailed(`Found vulnerabilities in the project.`);
          }
          else if (failOn === "error" && vulSeverity === "error") {
              ghCore.info(
                  `Input "${Inputs.FAIL_ON}" is "${failOn}", and at least one error was found. Failing workflow.`
              );
              ghCore.setFailed(`Found high severity vulnerabilities in the project.`);
          }
      }
      else {
          ghCore.warning(`Found "${vulSeverity}" level vulnerabilities`);
          ghCore.info(`Input "${Inputs.FAIL_ON}" is "${failOn}". Not failing workflow.`);
      }
  }
  else {
      ghCore.info(`✅ No vulnerabilities were found`);
  }

}

run()
  .then(() => {
    // nothing
  })
  .catch(async (err) => {
    if (prData != null) {
        await addLabelsToPr(prData.number, [ RhdaLabels.RHDA_SCAN_FAILED ]);
    }
    ghCore.setFailed(err.message);
  })
  .finally(async () => {
    if (prData != null) {
      await checkoutCleanup(prData.number, originalCheckoutBranch);
    }
  });