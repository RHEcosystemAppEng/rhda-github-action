import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as github from '@actions/github';
import * as ghCore from '@actions/core';

import { isPr, handlePr } from '../../src/pr/handler';
import * as types from '../../src/pr/types';
import { createRepoLabels, cleanupLabels } from '../../src/pr/labels';
import { checkoutPr } from '../../src/pr/checkout';

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    debug: vi.fn(),
}));

vi.mock('../../src/pr/labels', () => ({
    createRepoLabels: vi.fn(),
    cleanupLabels: vi.fn(),
}));

vi.mock('../../src/pr/checkout', () => ({
    checkoutPr: vi.fn(),
}));

describe('isPr', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return undefined if the event is not a pull request', async () => {
        github.context.payload.pull_request = undefined;

        const result = await isPr();
        expect(result).toEqual(undefined);
        expect(ghCore.info).toHaveBeenCalledWith(
            'No checkout required, item is not a pull request',
        );
    });

    it('should return parsed PR data if the event is a pull request', async () => {
        const prRawData = {
            user: {
                login: 'author',
            },
            number: 123,
            head: {
                sha: 'sha123',
                repo: {
                    html_url: 'headHtmlUrl',
                    owner: {
                        login: 'headOwner',
                    },
                    name: 'headRepo',
                },
            },
            base: {
                repo: {
                    html_url: 'baseHtmlUrl',
                    owner: {
                        login: 'baseOwner',
                    },
                    name: 'baseRepo',
                },
            },
        };
        github.context.payload.pull_request = prRawData as any;

        const result = await isPr();
        expect(result).to.deep.equal({
            author: 'author',
            number: 123,
            sha: 'sha123',
            ref: 'refs/pull/123/head',
            baseRepo: {
                htmlUrl: 'baseHtmlUrl',
                owner: 'baseOwner',
                repo: 'baseRepo',
            },
            headRepo: {
                htmlUrl: 'headHtmlUrl',
                owner: 'headOwner',
                repo: 'headRepo',
            },
        });
        expect(ghCore.info).toHaveBeenCalledWith(
            'ℹ️ PR authored by author is coming from headHtmlUrl against baseHtmlUrl',
        );
    });

    it('should return parsed PR data if the event is a pull request and author is undefined', async () => {
        const prRawData = {
            number: 123,
            head: {
                sha: 'sha123',
                repo: {
                    html_url: 'headHtmlUrl',
                    owner: {
                        login: 'headOwner',
                    },
                    name: 'headRepo',
                },
            },
            base: {
                repo: {
                    html_url: 'baseHtmlUrl',
                    owner: {
                        login: 'baseOwner',
                    },
                    name: 'baseRepo',
                },
            },
        };
        github.context.payload.pull_request = prRawData as any;

        const result = await isPr();
        expect(result).to.deep.equal({
            author: undefined,
            number: 123,
            sha: 'sha123',
            ref: 'refs/pull/123/head',
            baseRepo: {
                htmlUrl: 'baseHtmlUrl',
                owner: 'baseOwner',
                repo: 'baseRepo',
            },
            headRepo: {
                htmlUrl: 'headHtmlUrl',
                owner: 'headOwner',
                repo: 'headRepo',
            },
        });
        expect(ghCore.info).toHaveBeenCalledWith(
            'ℹ️ PR authored by undefined is coming from headHtmlUrl against baseHtmlUrl',
        );
    });

    it('should throw error when base repo owner does not exist', async () => {
        const prRawData = {
            user: {
                login: 'author',
            },
            number: 123,
            head: {
                sha: 'sha123',
                repo: {
                    html_url: 'headHtmlUrl',
                    owner: {
                        login: 'headOwner',
                    },
                    name: 'headRepo',
                },
            },
            base: {
                repo: {
                    html_url: 'baseHtmlUrl',
                    name: 'baseRepo',
                },
            },
        };
        github.context.payload.pull_request = prRawData as any;

        expect(isPr()).rejects.toThrow(
            `Could not determine owner of pull request base repository`,
        );
    });

    it('should throw error when head repo owner does not exist', async () => {
        const prRawData = {
            user: {
                login: 'author',
            },
            number: 123,
            head: {
                sha: 'sha123',
                repo: {
                    html_url: 'headHtmlUrl',
                    name: 'headRepo',
                },
            },
            base: {
                repo: {
                    html_url: 'baseHtmlUrl',
                    owner: {
                        login: 'baseOwner',
                    },
                    name: 'baseRepo',
                },
            },
        };
        github.context.payload.pull_request = prRawData as any;

        expect(isPr()).rejects.toThrow(
            `Could not determine owner of pull request head repository`,
        );
    });
});

describe('handlePr', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle the PR workflow', async () => {
        const pr: types.IPrData = {
            author: 'author',
            number: 123,
            sha: 'sha123',
            ref: 'refs/pull/123/head',
            baseRepo: {
                htmlUrl: 'baseHtmlUrl',
                owner: 'baseOwner',
                repo: 'baseRepo',
            },
            headRepo: {
                htmlUrl: 'headHtmlUrl',
                owner: 'headOwner',
                repo: 'headRepo',
            },
        };

        await handlePr(pr);

        expect(createRepoLabels).toHaveBeenCalledOnce();
        expect(cleanupLabels).toHaveBeenCalledWith(123);
        expect(checkoutPr).toHaveBeenCalledWith('baseHtmlUrl', 123);
    });
});
