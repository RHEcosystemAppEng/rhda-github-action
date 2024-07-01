import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Octokit } from '@octokit/core';
import * as github from '@actions/github';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import * as ghCore from '@actions/core';

import * as labels from '../../src/pr/labels'
import * as utils from '../../src/utils'
import { RhdaLabels } from '../../src/pr/labels'

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    getInput: vi.fn(),
    debug: vi.fn(),
}));

vi.mock('../utils.js', () => ({
    getGhToken: vi.fn().mockImplementation(() => 'fake-token'),
}));

vi.mock('@octokit/core');

vi.mock('@actions/github', () => ({
    context: {
      repo: {
        owner: 'owner',
        repo: 'repo',
      },
      payload: {
        pull_request: {
          number: 123,
        },
      },
    },
}));

describe('Label Functions', () => {

    const prNumber = 123;
    const emptyOcktokitResponse = []
    const ocktokitResponse = [{
          id: 1,
          node_id: '1',
          url: 'https://url',
          name: RhdaLabels.RHDA_SCAN_FAILED,
          description: null,
          color: 'green',
          default: false,
      },
      {
          id: 2,
          node_id: '2',
          url: 'https://url',
          name: RhdaLabels.RHDA_SCAN_PASSED,
          description: null,
          color: 'green',
          default: false,
      },
      {
          id: 3,
          node_id: '3',
          url: 'https://url',
          name: RhdaLabels.RHDA_FOUND_WARNING,
          description: null,
          color: 'green',
          default: false,
      },
      {
          id: 4,
          node_id: '4',
          url: 'https://url',
          name: RhdaLabels.RHDA_FOUND_ERROR,
          description: null,
          color: 'green',
          default: false,
      }
    ]
    
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    describe('getLabelColor', () => {
      it('should return the correct color for each label', () => {
        expect(labels.getLabelColor(RhdaLabels.RHDA_SCAN_PASSED)).toBe('0E8A16');
        expect(labels.getLabelColor(RhdaLabels.RHDA_SCAN_FAILED)).toBe('E11D21');
        expect(labels.getLabelColor(RhdaLabels.RHDA_FOUND_WARNING)).toBe('EE9900');
        expect(labels.getLabelColor(RhdaLabels.RHDA_FOUND_ERROR)).toBe('B60205');
        expect(labels.getLabelColor('Unknown Label')).toBe('FBCA04');
      });
    });
  
    describe('getLabelDescription', () => {
      it('should return the correct description for each label', () => {
        expect(labels.getLabelDescription(RhdaLabels.RHDA_SCAN_PASSED)).toBe('RHDA found no vulnerabilities');
        expect(labels.getLabelDescription(RhdaLabels.RHDA_SCAN_FAILED)).toBe('RHDA scan failed unexpectedly');
        expect(labels.getLabelDescription(RhdaLabels.RHDA_FOUND_WARNING)).toBe(`RHDA found 'warning' level vulnerabilities`);
        expect(labels.getLabelDescription(RhdaLabels.RHDA_FOUND_ERROR)).toBe(`RHDA found 'error' level vulnerabilities`);
        expect(labels.getLabelDescription('Unknown Label')).toBe('');
      });
    });
  
    describe('createRepoLabels', () => {
      it('should create missing labels in the repository', async () => {
        const octokitMock = {
            request: vi.fn(),
            paginate: vi.fn().mockResolvedValue(emptyOcktokitResponse),
        };

        const pluginMock = {
            plugin: vi.fn(() => function() {
                return octokitMock;
            }),
        };

        (Octokit as any).plugin = pluginMock.plugin;
        const actionsOctokit = Octokit.plugin(paginateRest);
        const actionsOctokitMock = new actionsOctokit({ auth: utils.getGhToken() });

        (Octokit as any).mockImplementation(() => octokitMock as any);

        await labels.createRepoLabels();
  
        expect(actionsOctokitMock.paginate).toHaveBeenCalledWith(
          'GET /repos/{owner}/{repo}/labels',
          {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
          }
        );

        labels.repoLabels.forEach((label) => {
            expect(ghCore.info).toHaveBeenCalledWith(`Creating label "${label}"`);
            expect(octokitMock.request).toHaveBeenCalledWith('POST /repos/{owner}/{repo}/labels', {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: label,
                color: labels.getLabelColor(label),
                description: labels.getLabelDescription(label),
          });
        });
      });

      it('should not create any labels when all RHDA labels already exist in the repository', async () => {
        const octokitMock = {
            request: vi.fn(),
            paginate: vi.fn().mockResolvedValue(ocktokitResponse),
        };

        const pluginMock = {
            plugin: vi.fn(() => function() {
                return octokitMock;
            }),
        };

        (Octokit as any).plugin = pluginMock.plugin;
        const actionsOctokit = Octokit.plugin(paginateRest);
        const actionsOctokitMock = new actionsOctokit({ auth: utils.getGhToken() });

        (Octokit as any).mockImplementation(() => octokitMock as any);

        await labels.createRepoLabels();
  
        expect(actionsOctokitMock.paginate).toHaveBeenCalledWith(
          'GET /repos/{owner}/{repo}/labels',
          {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
          }
        );

        expect(ghCore.info).not.toHaveBeenCalled();
        expect(octokitMock.request).not.toHaveBeenCalled()
      });
    });
  
    describe('cleanupLabels', () => {
        it('should remove existing RHDA labels from the PR', async () => {
        const octokitMock = {
            request: vi.fn(),
            paginate: vi.fn().mockResolvedValue(ocktokitResponse),
        };

        const pluginMock = {
            plugin: vi.fn(() => function() {
                return octokitMock;
            }),
        };

        (Octokit as any).plugin = pluginMock.plugin;
        const actionsOctokit = Octokit.plugin(paginateRest);
        const actionsOctokitMock = new actionsOctokit({ auth: utils.getGhToken() });

        (Octokit as any).mockImplementation(() => octokitMock as any);

        await labels.cleanupLabels(prNumber);

        expect(actionsOctokitMock.paginate).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/issues/{issue_number}/labels',
            {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber,
            }
        );
        expect(ghCore.info).toHaveBeenCalledWith(`Removing labels \"${RhdaLabels.RHDA_SCAN_FAILED}\", \"${RhdaLabels.RHDA_SCAN_PASSED}\", \"${RhdaLabels.RHDA_FOUND_WARNING}\", \"${RhdaLabels.RHDA_FOUND_ERROR}\" from pull request`);
        labels.repoLabels.forEach((label) => {
            expect(octokitMock.request).toHaveBeenCalledWith(
            'DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}',
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: prNumber,
                name: label,
            }
            );
        });
        });

        it('should do nothing if no RHDA labels exist in the PR', async () => {
        const octokitMock = {
            request: vi.fn(),
            paginate: vi.fn().mockResolvedValue(emptyOcktokitResponse),
        };

        const pluginMock = {
            plugin: vi.fn(() => function() {
            return octokitMock;
            }),
        };

        (Octokit as any).plugin = pluginMock.plugin;
        const actionsOctokit = Octokit.plugin(paginateRest);
        const actionsOctokitMock = new actionsOctokit({ auth: utils.getGhToken() });

        (Octokit as any).mockImplementation(() => octokitMock as any);

        await labels.cleanupLabels(prNumber);

        expect(actionsOctokitMock.paginate).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/issues/{issue_number}/labels',
            {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber,
            }
        );
        expect(octokitMock.request).not.toHaveBeenCalled();
        expect(ghCore.info).not.toHaveBeenCalled();
        });
    });
  
    describe('addLabelsToPr', () => {
      it('should add labels to the PR', async () => {
        const repoLabels = ['label1', 'label2']
        const octokitMock = {
            request: vi.fn(),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        await labels.addLabelsToPr(prNumber, repoLabels);
  
        expect(ghCore.info).toHaveBeenCalledWith(`Adding labels \"label1\", \"label2\" to pull request`);
        expect(octokitMock.request).toHaveBeenCalledWith(
          'POST /repos/{owner}/{repo}/issues/{issue_number}/labels',
          {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber,
            labels: repoLabels,
          }
        );
      });
    });
  });