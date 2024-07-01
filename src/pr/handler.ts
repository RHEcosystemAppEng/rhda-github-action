import * as ghCore from '@actions/core';
import * as github from '@actions/github';
import { components } from '@octokit/openapi-types';

import * as types from './types.js';
import { createRepoLabels, cleanupLabels } from './labels.js';
import * as checkout from './checkout.js';

type PullRequest = components['schemas']['pull-request-simple'];

async function isPr(): Promise<types.IPrData | undefined> {
    // check if event is pull request
    const prRawData = github.context.payload.pull_request as PullRequest;
    if (!prRawData) {
        ghCore.info(`No checkout required, item is not a pull request`);
        return;
    }

    // parse PR data
    const pr = parsePrData(prRawData);
    ghCore.debug(`PR number is ${pr.number}`);
    ghCore.info(
        `ℹ️ PR authored by ${pr.author} is coming from ${pr.headRepo.htmlUrl} against ${pr.baseRepo.htmlUrl}`,
    );

    return pr;
}

async function handlePr(pr: types.IPrData): Promise<void> {
    // create and load pr labels
    await createRepoLabels();

    // remove existing rhda labels before run
    await cleanupLabels(pr.number);

    // checkout pr
    await checkout.checkoutPr(pr.baseRepo.htmlUrl, pr.number);
}

function parsePrData(pr: PullRequest): types.IPrData {
    const baseOwner = pr.base.repo.owner?.login;
    if (!baseOwner) {
        throw new Error(
            `Could not determine owner of pull request base repository`,
        );
    }
    const headOwner = pr.head.repo.owner?.login;
    if (!headOwner) {
        throw new Error(
            `Could not determine owner of pull request head repository`,
        );
    }

    return {
        author: pr.user?.login,
        number: pr.number,
        sha: pr.head.sha,
        ref: `refs/pull/${pr.number}/head`,
        baseRepo: {
            htmlUrl: pr.base.repo.html_url,
            owner: baseOwner,
            repo: pr.base.repo.name,
        },
        headRepo: {
            htmlUrl: pr.head.repo.html_url,
            owner: headOwner,
            repo: pr.head.repo.name,
        },
    };
}

export { isPr, handlePr };
