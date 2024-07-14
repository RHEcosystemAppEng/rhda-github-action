import { describe, it, expect, vi, beforeEach } from 'vitest';

import { rhdaToResult } from '../../src/sarif/results';
import * as types from '../../src/sarif/types';
import { resolveVersionFromReference } from '../../src/sarif/convert.js';

vi.mock('../../src/sarif/rules', () => ({
    fetchIssueRules: vi.fn().mockImplementation(() => 'example rule'),
    fetchRecomendationRules: vi.fn().mockImplementation(() => 'example rule'),
}));

describe('rhdaToResult', () => {
    const manifestFilePath = 'path/to/manifest';
    const startLine = 5;
    const issueData: types.IIssue = {
        id: '123',
        severity: 'MEDIUM',
        title: 'Medium Vulnerability',
        cves: ['CVE-5678'],
        cvss: { cvss: '9.8' },
        remediation: {
            trustedContent: {
                ref: 'pkg:ecosystem/groupId/artifact@remediationversion',
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return correct SARIF result for a dependency with issues', () => {
        const refHasIssues = true;

        const transitiveDependencyData: types.IDependencyData = {
            imageRef: '',
            depRef: 'pkg:ecosystem/groupId1/artifact1@version1',
            depGroup: 'groupId1',
            depName: 'groupId1/artifact1',
            depVersion: 'version1',
            ecosystem: 'ecosystem',
            providerId: 'providerId',
            sourceId: 'sourceId',
            issues: [issueData],
            transitives: null,
            recommendationRef:
                'pkg:ecosystem/groupId/artifact@recommendedversion',
        };

        const dependencyData: types.IDependencyData = {
            imageRef: '',
            depRef: 'pkg:ecosystem/groupId/artifact@version',
            depGroup: 'groupId',
            depName: 'groupId/artifact',
            depVersion: 'version',
            ecosystem: 'ecosystem',
            providerId: 'providerId',
            sourceId: 'sourceId',
            issues: [issueData],
            transitives: [transitiveDependencyData],
            recommendationRef:
                'pkg:ecosystem/groupId/artifact@recommendedversion',
        };

        const expectedResult = [
            [
                {
                    ruleId: issueData.id,
                    message: {
                        text:
                            `This line introduces a "${issueData.title}" vulnerability with ` +
                            `${issueData.severity} severity.\n` +
                            `Vulnerability data provider is ${dependencyData.providerId}.\n` +
                            `Vulnerability data source is ${dependencyData.sourceId}.\n` +
                            `Vulnerable dependency is ${dependencyData.depGroup}/${dependencyData.depName} version ${dependencyData.depVersion}.\n` +
                            `Recommended remediation version: ${resolveVersionFromReference(issueData.remediation.trustedContent ? issueData.remediation.trustedContent.ref : '')}`,
                    },
                    locations: [
                        {
                            physicalLocation: {
                                artifactLocation: {
                                    uri: manifestFilePath,
                                },
                                region: {
                                    startLine: startLine,
                                },
                            },
                        },
                    ],
                },
                {
                    ruleId: issueData.id,
                    message: {
                        text:
                            `This line introduces a "${issueData.title}" vulnerability with ` +
                            `${issueData.severity} severity.\n` +
                            `Vulnerability data provider is ${transitiveDependencyData.providerId}.\n` +
                            `Vulnerability data source is ${transitiveDependencyData.sourceId}.\n` +
                            `Vulnerable transitive dependency is ${transitiveDependencyData.depGroup}/${transitiveDependencyData.depName} version ${transitiveDependencyData.depVersion}.\n` +
                            `Recommended remediation version: ${resolveVersionFromReference(issueData.remediation.trustedContent ? issueData.remediation.trustedContent.ref : '')}`,
                    },
                    locations: [
                        {
                            physicalLocation: {
                                artifactLocation: {
                                    uri: manifestFilePath,
                                },
                                region: {
                                    startLine: startLine,
                                },
                            },
                        },
                    ],
                },
            ],
            ['example rule', 'example rule'],
        ];

        const results = rhdaToResult(
            dependencyData,
            manifestFilePath,
            startLine,
            refHasIssues,
        );

        expect(results).toStrictEqual(expectedResult);
    });

    it('should return correct SARIF result for a image dependency with issues', () => {
        const refHasIssues = true;

        const transitiveDependencyData: types.IDependencyData = {
            imageRef: 'image:tag',
            depRef: 'pkg:ecosystem/artifact1',
            depGroup: '',
            depName: 'artifact1',
            depVersion: '',
            ecosystem: 'ecosystem',
            providerId: 'providerId',
            sourceId: 'sourceId',
            issues: [issueData],
            transitives: null,
            recommendationRef:
                'pkg:ecosystem/groupId/artifact@recommendedversion',
        };

        const dependencyData: types.IDependencyData = {
            imageRef: 'image:tag',
            depRef: 'pkg:ecosystem/groupId/artifact@version',
            depGroup: 'groupId',
            depName: 'groupId/artifact',
            depVersion: 'version',
            ecosystem: 'ecosystem',
            providerId: 'providerId',
            sourceId: 'sourceId',
            issues: [issueData],
            transitives: [transitiveDependencyData],
            recommendationRef:
                'pkg:ecosystem/groupId/artifact@recommendedversion',
        };

        const expectedResult = [
            [
                {
                    ruleId: issueData.id,
                    message: {
                        text:
                            `This line introduces a "${issueData.title}" vulnerability with ` +
                            `${issueData.severity} severity.\n` +
                            `Vulnerability data provider is ${dependencyData.providerId}.\n` +
                            `Vulnerability data source is ${dependencyData.sourceId}.\n` +
                            `Vulnerable dependency is ${dependencyData.depGroup}/${dependencyData.depName} version ${dependencyData.depVersion}.\n` +
                            `Recommended remediation version: ${resolveVersionFromReference(issueData.remediation.trustedContent ? issueData.remediation.trustedContent.ref : '')}`,
                    },
                    locations: [
                        {
                            physicalLocation: {
                                artifactLocation: {
                                    uri: manifestFilePath,
                                },
                                region: {
                                    startLine: startLine,
                                },
                            },
                        },
                    ],
                },
                {
                    ruleId: issueData.id,
                    message: {
                        text:
                            `This line introduces a "${issueData.title}" vulnerability with ` +
                            `${issueData.severity} severity.\n` +
                            `Vulnerability data provider is ${transitiveDependencyData.providerId}.\n` +
                            `Vulnerability data source is ${transitiveDependencyData.sourceId}.\n` +
                            `Vulnerable transitive dependency is ${transitiveDependencyData.depName}.\n` +
                            `Recommended remediation version: ${resolveVersionFromReference(issueData.remediation.trustedContent ? issueData.remediation.trustedContent.ref : '')}`,
                    },
                    locations: [
                        {
                            physicalLocation: {
                                artifactLocation: {
                                    uri: manifestFilePath,
                                },
                                region: {
                                    startLine: startLine,
                                },
                            },
                        },
                    ],
                },
            ],
            ['example rule', 'example rule'],
        ];

        const results = rhdaToResult(
            dependencyData,
            manifestFilePath,
            startLine,
            refHasIssues,
        );

        expect(results).toStrictEqual(expectedResult);
    });

    it('should return correct SARIF result for a dependency without issues and with recommendation', () => {
        const refHasIssues = false;

        const dependencyData: types.IDependencyData = {
            imageRef: '',
            depRef: 'pkg:ecosystem/groupId/artifact@version',
            depGroup: 'groupId',
            depName: 'groupId/artifact',
            depVersion: 'version',
            ecosystem: 'ecosystem',
            providerId: 'providerId',
            sourceId: 'sourceId',
            issues: null,
            transitives: null,
            recommendationRef:
                'pkg:ecosystem/groupId/artifact@recommendedversion',
        };

        const expectedResult = [
            [
                {
                    ruleId: dependencyData.recommendationRef,
                    message: {
                        text: `Recommended Red Hat verified version: ${dependencyData.recommendationRef}.`,
                    },
                    locations: [
                        {
                            physicalLocation: {
                                artifactLocation: {
                                    uri: manifestFilePath,
                                },
                                region: {
                                    startLine: startLine,
                                },
                            },
                        },
                    ],
                },
            ],
            ['example rule'],
        ];

        const results = rhdaToResult(
            dependencyData,
            manifestFilePath,
            startLine,
            refHasIssues,
        );

        expect(results).toStrictEqual(expectedResult);
    });
});
