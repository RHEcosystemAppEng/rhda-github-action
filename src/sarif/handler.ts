import * as ghCore from '@actions/core';
import * as github from "@actions/github";
import path from 'path';

import { Inputs, Outputs } from '../generated/inputs-outputs.js';
import * as convert from './convert.js';
import * as upload from './upload.js';
import * as utils from '../utils.js';
import { PrData } from '../pr/types.js';
import * as constants from '../constants.js';

export async function handleSarif(rhdaReportJson: any, manifestFilePath: string, ecosystem: string, sha: string, ref: string, analysisStartTime: string, prData: PrData): Promise<{rhdaReportSarifFilePath: string, vulSeverity: constants.VulnerabilitySeverity}> {
    ghCore.info(`⏳ Converting RHDA report JSON to SARIF...`);

    const { sarifObject: rhdaReportSarif, vulSeverity: vulSeverity } = await convert.generateSarif(rhdaReportJson, manifestFilePath, ecosystem);

    const rhdaReportSarifFilePath: string = path.resolve(".", `${ghCore.getInput(Inputs.RHDA_REPORT_NAME)}.sarif`);
    await utils.writeToFile(JSON.stringify(rhdaReportSarif,null,4), rhdaReportSarifFilePath);
    
    ghCore.info(`✅ Successfully converted RHDA report JSON to SARIF`);

    ghCore.info(`✍️ Setting output "${Outputs.RHDA_REPORT_SARIF}" to ${rhdaReportSarifFilePath}`);
    ghCore.setOutput(Outputs.RHDA_REPORT_SARIF, utils.escapeWindowsPathForActionsOutput(rhdaReportSarifFilePath));

    const uploadSarif = ghCore.getBooleanInput(Inputs.UPLOAD_SARIF);
    if (uploadSarif) {
        const githubToken = ghCore.getInput(Inputs.GITHUB_TOKEN);
        // only print the security tab link if the PR head repo is also the base repo (ie, the PR is against itself)
        // otherwise, the branch will not exist and the link will be useless.
        const printSecurityTabLink = !prData
            || (prData.baseRepo.owner === prData.headRepo.owner && prData.baseRepo.repo === prData.headRepo.repo);

        await upload.uploadSarifFile(
            githubToken, rhdaReportSarifFilePath, analysisStartTime, sha, ref, github.context.repo, printSecurityTabLink,
        );
    }
    else {
        ghCore.info(`⏩ Input "${Inputs.UPLOAD_SARIF}" is false, skipping SARIF upload.`);
    }

    return { rhdaReportSarifFilePath, vulSeverity };
}