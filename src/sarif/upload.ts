import * as ghCore from '@actions/core';
import { Octokit } from "@octokit/core";
import * as github from "@actions/github";

import * as utils from '../utils.js'

export async function uploadSarifFile(
    ghToken: string, sarifPath: string,
    analysisStartTime: string,
    sha: string, ref: string,
    uploadToRepo: { owner: string, repo: string },
    printSecurityTabLink: boolean,
): Promise<void> {

    const sarifZipped = await utils.zipFile(sarifPath);

    const { owner, repo } = uploadToRepo;

    ghCore.info(`⬆️ Uploading SARIF to ${owner}/${repo}`);
    ghCore.debug(`Commit Sha: ${sha}`);
    ghCore.debug(`Ref: ${ref}`);

    // API documentation: https://docs.github.com/en/rest/reference/code-scanning#update-a-code-scanning-alert
    const octokit = new Octokit({ auth: ghToken });
    let sarifId;
    try {
        const uploadResponse = await octokit.request("POST /repos/{owner}/{repo}/code-scanning/sarifs", {
            owner,
            repo,
            ref,
            commit_sha: sha,
            sarif: sarifZipped,
            // checkout_uri: manifestDir,
            started_at: analysisStartTime,
            tool_name: "Red Hat Dependency Analytics",
        });

        ghCore.debug(JSON.stringify(uploadResponse));
        if (uploadResponse.data.id !== undefined) {
            ghCore.debug(uploadResponse.data.id);
            sarifId = uploadResponse.data.id;
        }
    }
    catch (err) {
        throw utils.prettifyHttpError(err);
    }

    if (!sarifId) {
        throw new Error(`Upload SARIF response from GitHub did not include an upload ID`);
    }

    try {
        ghCore.startGroup(`⏳ Waiting for SARIF to upload...`);
        await waitForUploadToFinish(ghToken, sarifId);
    }
    finally {
        ghCore.endGroup();
    }

    ghCore.info(`✅ Successfully uploaded SARIF file`);

    if (printSecurityTabLink) {
        ghCore.debug(`Printing link to Code Scanning results`);

        let branch;
        const BRANCH_REF_PREFIX = "refs/heads/";
        if (ref.startsWith(BRANCH_REF_PREFIX)) {
            branch = ref.substring(BRANCH_REF_PREFIX.length);
        }

        const search: URLSearchParams = new URLSearchParams({
            query: `is:open sort:created-desc${branch ? ` branch:${branch}` : ""}`,
        });

        const codeScanningUrl = utils.getEnvVar("GITHUB_SERVER_URL")
            + `/${owner}/${repo}/security/code-scanning?${search.toString()}`;

        ghCore.info(`👀 Review the Code Scanning results in the Security tab: ${codeScanningUrl}`);
    }
}

async function waitForUploadToFinish(ghToken: string, sarifId: string): Promise<void> {
    let uploadStatus = "pending";

    // API documentation: https://docs.github.com/en/rest/reference/code-scanning#get-information-about-a-sarif-upload
    const octokit = new Octokit({ auth: ghToken });

    const delay = 2 * 1000;
    const timeout = 120000;
    const maxTries = timeout / delay;
    let tries = 0;

    while (uploadStatus !== "complete") {
        try {
            const response = await octokit.request("GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}", {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                sarif_id: sarifId,
            });

            ghCore.debug(JSON.stringify(response));
            if (response.data.processing_status !== undefined) {
                uploadStatus = response.data.processing_status;

                const emoji = uploadStatus === "pending" ? "⏳ " : "";
                ghCore.info(`${emoji}Upload is ${response.data.processing_status}`);
            }

        }
        catch (err) {
            throw utils.prettifyHttpError(err);
        }

        if (tries > maxTries) {
            throw new Error(`SARIF upload timed out: status was ${uploadStatus} after ${timeout / 1000}s.`);
        }

        if (uploadStatus === "pending") {
            await new Promise((r) => setTimeout(r, delay));
        }
        tries++;
    }
}
