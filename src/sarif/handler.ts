import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import { Inputs, Outputs } from '../generated/inputs-outputs.js';
import * as convert from './convert.js';
import * as upload from './upload.js';
import * as utils from '../utils.js';
import { IPrData } from '../pr/types.js';
import * as constants from '../constants.js';

/**
 * Handles the conversion of RHDA report JSON to SARIF format, writing it to a file,
 * setting outputs, and optionally uploading it to GitHub Actions.
 * @param rhdaReportJson - The RHDA report JSON to convert.
 * @param manifestFilePath - The path to the manifest file being analyzed.
 * @param ecosystem - The ecosystem related to the analysis.
 * @param sha - The SHA of the commit being analyzed.
 * @param ref - The reference (branch or tag) being analyzed.
 * @param analysisStartTime - The start time of the analysis.
 * @param prData - Pull request data if available.
 * @returns An object containing the path to the generated SARIF file and the vulnerability severity level.
 */
export async function handleSarif(
    rhdaReportJson: any,
    manifestFilePath: string,
    ecosystem: string,
    sha: string,
    ref: string,
    analysisStartTime: string,
    prData: IPrData,
): Promise<{
    rhdaReportSarifFilePath: string;
    vulSeverity: constants.VulnerabilitySeverity;
}> {
    ghCore.info(`⏳ Converting RHDA report JSON to SARIF...`);

    const { sarifObject: rhdaReportSarif, vulSeverity: vulSeverity } =
        await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );

    const rhdaReportSarifFilePath: string = `${process.cwd()}/${ghCore.getInput(Inputs.RHDA_REPORT_NAME)}.sarif`;
    await utils.writeToFile(
        JSON.stringify(rhdaReportSarif, null, 4),
        rhdaReportSarifFilePath,
    );

    ghCore.info(`✅ Successfully converted RHDA report JSON to SARIF`);

    ghCore.info(
        `✍️ Setting output "${Outputs.RHDA_REPORT_SARIF}" to ${rhdaReportSarifFilePath}`,
    );
    ghCore.setOutput(
        Outputs.RHDA_REPORT_SARIF,
        utils.escapeWindowsPathForActionsOutput(rhdaReportSarifFilePath),
    );

    const uploadSarif = ghCore.getBooleanInput(Inputs.UPLOAD_SARIF);
    if (uploadSarif) {
        const githubToken = utils.getGhToken();
        // only print the security tab link if the PR head repo is also the base repo (ie, the PR is against itself)
        // otherwise, the branch will not exist and the link will be useless.
        const printSecurityTabLink =
            !prData ||
            (prData.baseRepo.owner === prData.headRepo.owner &&
                prData.baseRepo.repo === prData.headRepo.repo);

        await upload.uploadSarifFile(
            githubToken,
            rhdaReportSarifFilePath,
            analysisStartTime,
            sha,
            ref,
            github.context.repo,
            printSecurityTabLink,
        );
    } else {
        ghCore.info(
            `⏩ Input "${Inputs.UPLOAD_SARIF}" is false, skipping SARIF upload.`,
        );
    }

    return { rhdaReportSarifFilePath, vulSeverity };
}
