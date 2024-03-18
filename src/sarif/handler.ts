import * as ghCore from '@actions/core';
import * as github from "@actions/github";

import { Inputs, Outputs } from '../generated/inputs-outputs.js';
import * as convert from './convert.js';
import * as upload from './upload.js';
import * as utils from '../utils/utils.js'

export async function handleSarif(rhdaReportJson: any, manifestFilePath: string, sha: string, ref: string, analysisStartTime: string) {
    
    const rhdaReportSarifPath = await convert.generateSarif(rhdaReportJson, manifestFilePath);

    ghCore.info(`ℹ️ Successfully converted RHDA JSON report to SARIF`);

    ghCore.info(`✍️ Setting output "${Outputs.RHDA_REPORT_SARIF}" to ${rhdaReportSarifPath}`);
    ghCore.setOutput(Outputs.RHDA_REPORT_SARIF, utils.escapeWindowsPathForActionsOutput(rhdaReportSarifPath));

    const uploadSarif = ghCore.getBooleanInput(Inputs.UPLOAD_SARIF);
    if (uploadSarif) {
        const githubToken = ghCore.getInput(Inputs.GITHUB_TOKEN);
        // only print the security tab link if the PR head repo is also the base repo (ie, the PR is against itself)
        // otherwise, the branch will not exist and the link will be useless.
        // const printSecurityTabLink = prData == null
        //     || (prData.baseRepo.owner === prData.headRepo.owner && prData.baseRepo.repo === prData.headRepo.repo);

        await upload.uploadSarifFile(
            githubToken, rhdaReportSarifPath, analysisStartTime, sha, ref, github.context.repo, undefined,
        );
    }
    else {
        ghCore.info(`⏩ Input "${Inputs.UPLOAD_SARIF}" is false, skipping SARIF upload.`);
    }
}