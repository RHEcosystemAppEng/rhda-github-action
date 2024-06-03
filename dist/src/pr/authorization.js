import * as ghCore from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";
import * as labels from "./labels.js";
import { RhdaLabels } from "./labels.js";
import { getGhToken, prettifyHttpError } from "../utils.js";
export async function isPrScanApproved(pr) {
    ghCore.info(`Scan is running in a pull request, checking for approval label...`);
    // get author authorization
    let prAuthorHasWriteAccess = await canPrAuthorWrite(pr);
    // update labels
    const availableLabels = await labels.getLabels(pr.number);
    if (availableLabels.length !== 0) {
        ghCore.debug(`Pull request labels are: ${availableLabels.map((s) => `"${s}"`).join(", ")}`);
    }
    else {
        ghCore.debug("No labels found");
    }
    const prAction = github.context.payload.action;
    ghCore.debug(`Action performed is "${prAction}"`);
    if (prAction === "edited" || prAction === "synchronize") {
        ghCore.info(`Code change detected`);
        let labelsToRemove = labels.findLabelsToRemove(availableLabels);
        // if pr author has write access do not remove approved label
        if (prAuthorHasWriteAccess) {
            labelsToRemove = labelsToRemove.filter(label => label !== RhdaLabels.RHDA_SCAN_APPROVED);
        }
        if (labelsToRemove.length > 0) {
            await labels.removeLabelsFromPr(pr.number, labelsToRemove);
        }
        if (prAuthorHasWriteAccess) {
            return true;
        }
        ghCore.debug(`Adding "${RhdaLabels.RHDA_SCAN_PENDING}" label.`);
        await labels.addLabelsToPr(pr.number, [RhdaLabels.RHDA_SCAN_PENDING]);
        return false;
    }
    if (availableLabels.includes(RhdaLabels.RHDA_SCAN_APPROVED)) {
        if (availableLabels.includes(RhdaLabels.RHDA_SCAN_PENDING)) {
            await labels.removeLabelsFromPr(pr.number, [RhdaLabels.RHDA_SCAN_PENDING]);
        }
        ghCore.info(`"${RhdaLabels.RHDA_SCAN_APPROVED}" label is present`);
        return true;
    }
    if (prAuthorHasWriteAccess) {
        await labels.addLabelsToPr(pr.number, [RhdaLabels.RHDA_SCAN_APPROVED]);
        return true;
    }
    if (!availableLabels.includes(RhdaLabels.RHDA_SCAN_PENDING)) {
        await labels.addLabelsToPr(pr.number, [RhdaLabels.RHDA_SCAN_PENDING]);
    }
    return false;
}
// API documentation: https://docs.github.com/en/rest/reference/repos#get-repository-permissions-for-a-user
async function canPrAuthorWrite(pr) {
    if (!pr.author) {
        ghCore.warning(`Failed to determine pull request author`);
        return false;
    }
    ghCore.info(`Pull request author is "${pr.author}"`);
    const octokit = new Octokit({ auth: getGhToken() });
    const { owner, repo } = github.context.repo;
    let authorPermissionResponse;
    try {
        ghCore.info(`Checking if the user "${pr.author}" has write `
            + `access to repository "${owner}/${repo}"`);
        authorPermissionResponse = await octokit.request("GET /repos/{owner}/{repo}/collaborators/{username}/permission", {
            owner,
            repo,
            username: pr.author,
        });
    }
    catch (err) {
        throw prettifyHttpError(err);
    }
    const permission = authorPermissionResponse.data.permission;
    if (permission === "admin" || permission === "write") {
        ghCore.info(`User has write access to the repository`);
        return true;
    }
    ghCore.info(`User doesn't have write access to the repository`);
    return false;
}
//# sourceMappingURL=authorization.js.map