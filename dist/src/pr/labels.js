import { Octokit } from "@octokit/core";
import * as github from "@actions/github";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import * as ghCore from "@actions/core";
import { getGhToken, prettifyHttpError } from "../utils.js";
/**
 * RHDA labels to be added to a PR
 */
export var RhdaLabels;
(function (RhdaLabels) {
    RhdaLabels["RHDA_SCAN_PENDING"] = "RHDA Scan Pending";
    RhdaLabels["RHDA_SCAN_APPROVED"] = "RHDA Scan Approved";
    RhdaLabels["RHDA_SCAN_PASSED"] = "RHDA Scan Passed";
    RhdaLabels["RHDA_SCAN_FAILED"] = "RHDA Scan Failed";
    RhdaLabels["RHDA_FOUND_WARNING"] = "RHDA Found Warning";
    RhdaLabels["RHDA_FOUND_ERROR"] = "RHDA Found Error";
})(RhdaLabels || (RhdaLabels = {}));
export const repoLabels = [
    RhdaLabels.RHDA_SCAN_PENDING,
    RhdaLabels.RHDA_SCAN_APPROVED,
    RhdaLabels.RHDA_SCAN_FAILED,
    RhdaLabels.RHDA_SCAN_PASSED,
    RhdaLabels.RHDA_FOUND_WARNING,
    RhdaLabels.RHDA_FOUND_ERROR,
];
export const labelsToCheckForRemoval = [
    RhdaLabels.RHDA_SCAN_APPROVED,
    RhdaLabels.RHDA_SCAN_FAILED,
    RhdaLabels.RHDA_SCAN_PASSED,
    RhdaLabels.RHDA_FOUND_WARNING,
    RhdaLabels.RHDA_FOUND_ERROR,
];
export function getLabelColor(label) {
    switch (label) {
        case RhdaLabels.RHDA_SCAN_APPROVED:
            return "008080"; // teal color
        case RhdaLabels.RHDA_SCAN_PENDING:
            return "FBCA04"; // blue color
        case RhdaLabels.RHDA_SCAN_PASSED:
            return "0E8A16"; // green color
        case RhdaLabels.RHDA_SCAN_FAILED:
            return "E11D21"; // red color
        case RhdaLabels.RHDA_FOUND_WARNING:
            return "EE9900"; // yellow color
        case RhdaLabels.RHDA_FOUND_ERROR:
            return "B60205"; // red color
        default:
            return "FBCA04";
    }
}
export function getLabelDescription(label) {
    switch (label) {
        case RhdaLabels.RHDA_SCAN_APPROVED:
            return "RHDA scan approved by a collaborator";
        case RhdaLabels.RHDA_SCAN_PENDING:
            return "RHDA scan waiting for approval";
        case RhdaLabels.RHDA_SCAN_PASSED:
            return "RHDA found no vulnerabilities";
        case RhdaLabels.RHDA_SCAN_FAILED:
            return "RHDA scan failed unexpectedly";
        case RhdaLabels.RHDA_FOUND_WARNING:
            return `RHDA found "warning" level vulnerabilities`;
        case RhdaLabels.RHDA_FOUND_ERROR:
            return `RHDA found "error" level vulnerabilities`;
        default:
            return "";
    }
}
export async function createRepoLabels() {
    const availableLabels = await getLabels();
    if (availableLabels.length !== 0) {
        ghCore.debug(`Available Repo labels: ${availableLabels.map((s) => `"${s}"`).join(", ")}`);
    }
    else {
        ghCore.debug("No labels found in the repository");
    }
    const labelsToCreate = [];
    repoLabels.forEach((label) => {
        if (!availableLabels.includes(label)) {
            labelsToCreate.push(label);
        }
    });
    if (labelsToCreate.length !== 0) {
        ghCore.debug(`Labels to create in the repository: ${labelsToCreate.map((s) => `"${s}"`).join(", ")}`);
    }
    else {
        ghCore.debug("Required labels are already present in the repository. "
            + "No labels need to be created.");
    }
    await createLabels(labelsToCreate);
}
// API documentation: https://docs.github.com/en/rest/reference/issues#list-labels-for-an-issue
export async function getLabels(prNumber) {
    const ActionsOctokit = Octokit.plugin(paginateRest);
    const octokit = new ActionsOctokit({ auth: getGhToken() });
    let labelsResponse;
    try {
        if (prNumber) {
            labelsResponse = await octokit.paginate("GET /repos/{owner}/{repo}/issues/{issue_number}/labels", {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: prNumber,
            });
        }
        else {
            labelsResponse = await octokit.paginate("GET /repos/{owner}/{repo}/labels", {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
            });
        }
    }
    catch (err) {
        throw prettifyHttpError(err);
    }
    const availableLabels = labelsResponse.map((labels) => labels.name);
    return availableLabels;
}
// API documentation: https://docs.github.com/en/rest/reference/issues#create-a-label
async function createLabels(labels) {
    const octokit = new Octokit({ auth: getGhToken() });
    labels.forEach(async (label) => {
        try {
            ghCore.info(`Creating label ${label}`);
            await octokit.request("POST /repos/{owner}/{repo}/labels", {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: label,
                color: getLabelColor(label),
                description: getLabelDescription(label),
            });
        }
        catch (err) {
            throw prettifyHttpError(err);
        }
    });
}
// Find the labels present in the PR which can be removed
export function findLabelsToRemove(availableLabels) {
    const labelsToRemove = [];
    labelsToCheckForRemoval.forEach((label) => {
        if (availableLabels.includes(label)) {
            labelsToRemove.push(label);
        }
    });
    return labelsToRemove;
}
// API documentation: https://docs.github.com/en/rest/reference/issues#remove-a-label-from-an-issue
export async function removeLabelsFromPr(prNumber, labels) {
    ghCore.info(`Removing labels ${labels.map((s) => `"${s}"`).join(", ")} from pull request`);
    const octokit = new Octokit({ auth: getGhToken() });
    labels.forEach(async (label) => {
        try {
            await octokit.request("DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}", {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: prNumber,
                name: label,
            });
        }
        catch (err) {
            throw prettifyHttpError(err);
        }
    });
}
// API documentation: https://docs.github.com/en/rest/reference/issues#add-labels-to-an-issue
export async function addLabelsToPr(prNumber, labels) {
    ghCore.info(`Adding labels ${labels.map((s) => `"${s}"`).join(", ")} to pull request`);
    const octokit = new Octokit({ auth: getGhToken() });
    try {
        await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber,
            labels,
        });
    }
    catch (err) {
        throw prettifyHttpError(err);
    }
}
//# sourceMappingURL=labels.js.map