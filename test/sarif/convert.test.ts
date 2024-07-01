import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';
import * as fs from 'fs';

import * as convert from '../../src/sarif/convert';
import * as result from '../../src/sarif/results';
import * as types from '../../src/sarif/types';
import * as constants from '../../src/constants';

vi.mock('@actions/core', () => ({
    warning: vi.fn(),
}));

vi.mock('fs', () => ({
    readFileSync: vi.fn(),
}));

vi.mock('../../src/sarif/results', () => ({
    rhdaToResult: vi.fn(),
}));

vi.mock('../utils.js', () => ({
    isDefined: vi.fn((obj, key) => obj[key] !== undefined),
}));

describe('resolveDependencyFromReference', () => {
    it('should correctly resolve dependency from reference', () => {
        const ref = 'pkg:npm/lodash@4.17.20';
        const result = convert.resolveDependencyFromReference(ref);
        expect(result).toBe('lodash@4.17.20');
    });
});

describe('resolveEcosystemFromReference', () => {
    it('should correctly resolve ecosystem from reference', () => {
        const ref = 'pkg:npm/lodash@4.17.20';
        const result = convert.resolveEcosystemFromReference(ref);
        expect(result).toBe('npm');
    });

    it('should return undefined for invalid reference', () => {
        const ref = 'invalid-ref';
        const result = convert.resolveEcosystemFromReference(ref);
        expect(result).toBeUndefined();
    });
});

describe('resolveVersionFromReference', () => {
    it('should correctly resolve version from reference', () => {
        const ref = 'pkg:npm/lodash@4.17.20';
        const result = convert.resolveVersionFromReference(ref);
        expect(result).toBe('4.17.20');
    });

    it('should return empty string if no version is found', () => {
        const ref = 'pkg:npm/lodash';
        const result = convert.resolveVersionFromReference(ref);
        expect(result).toBe('');
    });
});

describe('generateSarif', () => {
    const manifestFilePath = 'path/to/manifest';

    const directVulnerability =   {
        id: "CVE-123",
        title: "Templates do not properly consider backticks.",
        cvss: {
            cvss: "CVSS:3.1"
        },
        severity: "CRITICAL",
        cves: [
            "CVE-123"
        ],
        remediation: {
            trustedContent: null
        }
    };

    const transitiveVulnerability = {
        ref: 'pkg:npm/lodash@4.17.20',
        issues: [directVulnerability],
        transitive: null,
    };

    const mockSarif = {
        $schema: constants.SARIF_SCHEMA_URL,
        version: constants.SARIF_SCHEMA_VERSION,
        runs: [
            {
                tool: {
                    driver: {
                        name: 'Red Hat Dependency Analytics',
                        rules: [],
                    },
                },
                results: [],
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(result.rhdaToResult).mockReturnValue([[], []]);
    });

    it('should generate SARIF from RHDA report JSON with direct and transitive vulnerabilities', async () => {
        const rhdaReportJson = {
            scanned: {
                total: 2,
                direct: 1,
                transitive: 1
            },
            providers: {
                provider1: {
                    status: { 
                        ok: true 
                    },
                    sources: {
                        source1: {
                            summary: { 
                                critical: 1, 
                                high: 0, 
                                medium: 0, 
                                low: 0 
                            },
                            dependencies: [
                                { 
                                    ref: 'pkg:npm/lodash@4.17.20',
                                    issues: [directVulnerability],
                                    transitive: [transitiveVulnerability],
                                },
                            ],
                        },
                    },
                },
            },
        };
        const ecosystem = 'npm';
        const manifestData = `
            {
                "dependencies": {
                    "lodash": "4.17.20",
                }
            }
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        
        const expectedIssueData: types.IIssue = {
            id: 'CVE-123',
            severity: 'CRITICAL',
            title: 'Templates do not properly consider backticks.',
            cves: ['CVE-123'],
            cvss: {cvss: 'CVSS:3.1'},
            remediation: {trustedContent: null}
        };
        
        const expectedTransitiveDependencyData: types.IDependencyData = {
            imageRef: undefined,
            depRef: 'pkg:npm/lodash@4.17.20',
            depGroup: undefined,
            depName: 'lodash',
            depVersion: '4.17.20',
            ecosystem: 'npm',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  [expectedIssueData],
            transitives: null,
            recommendationRef: ''
        };

        const expectedDependencyData: types.IDependencyData = {
            imageRef: undefined,
            depRef: 'pkg:npm/lodash@4.17.20',
            depGroup: undefined,
            depName: 'lodash',
            depVersion: '4.17.20',
            ecosystem: 'npm',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  [expectedIssueData],
            transitives: [expectedTransitiveDependencyData],
            recommendationRef: ''
        };

        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');

        expect(result.rhdaToResult).toHaveBeenCalledWith(
            expectedDependencyData,
            manifestFilePath,
            4,
            true
        );

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('error');
    });

    it('should generate SARIF from RHDA report JSON for MAVEN ecosystem', async () => {
        const rhdaReportJson = {
            scanned: {
                total: 2,
                direct: 1,
                transitive: 1
            },
            providers: {
                provider1: {
                    status: { 
                        ok: true 
                    },
                    sources: {
                        source1: {
                            summary: { 
                                critical: 1, 
                                high: 0, 
                                medium: 0, 
                                low: 0 
                            },
                            dependencies: [
                                { 
                                    ref: 'pkg:maven/log4j/log4j@1.2.17',
                                    issues: null,
                                    transitive: null,
                                },
                            ],
                        },
                    },
                },
            },
        };
        const ecosystem = 'maven';
        const manifestData = `
            <project>
                <dependencies>
                    <dependency>
                        <groupId>log4j</groupId>
                        <artifactId>log4j</artifactId>
                        <version>1.2.17</version>
                    </dependency>
                </dependencies>
            </project>
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );

        const expectedDependencyData: types.IDependencyData = {
            imageRef: undefined,
            depRef: 'pkg:maven/log4j/log4j@1.2.17',
            depGroup: 'log4j',
            depName: 'log4j',
            depVersion: '1.2.17',
            ecosystem: 'maven',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  null,
            transitives: null,
            recommendationRef: ''
        };

        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');

        expect(result.rhdaToResult).toHaveBeenCalledWith(
            expectedDependencyData,
            manifestFilePath,
            7,
            false
        );

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('error');
    });

    it('should generate SARIF from RHDA report JSON for GRADLE ecosystem', async () => {
        const rhdaReportJson = {
            scanned: {
                total: 2,
                direct: 1,
                transitive: 1
            },
            providers: {
                provider1: {
                    status: { 
                        ok: true 
                    },
                    sources: {
                        source1: {
                            summary: { 
                                critical: 1, 
                                high: 0, 
                                medium: 0, 
                                low: 0 
                            },
                            dependencies: [
                                { 
                                    ref: 'pkg:maven/log4j/log4j@1.2.17',
                                    issues: null,
                                    transitive: null,
                                },
                                { 
                                    ref: 'pkg:maven/log2j/log2j',
                                    issues: null,
                                    transitive: null,
                                },
                            ],
                        },
                    },
                },
            },
        };
        const ecosystem = 'gradle';
        const manifestData = `
            plugins {
                id 'java'
            }
            
            ext mockArg = 'mock'

            ext {
                groupArg = 'log4j'
            }

            repositories {
                mavenCentral()
            }
            
            dependencies { 
                implementation group: "\${groupArg}", name: "log4j", version: "1.2.17"
                implementation group: "log2j", name: "log2j"
            }
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );

        const expectedDependencyData1: types.IDependencyData = {
            imageRef: undefined,
            depRef: 'pkg:maven/log4j/log4j@1.2.17',
            depGroup: 'log4j',
            depName: 'log4j',
            depVersion: '1.2.17',
            ecosystem: 'gradle',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  null,
            transitives: null,
            recommendationRef: ''
        };

        const expectedDependencyData2: types.IDependencyData = {
            imageRef: undefined,
            depRef: 'pkg:maven/log2j/log2j',
            depGroup: 'log2j',
            depName: 'log2j',
            depVersion: '',
            ecosystem: 'gradle',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  null,
            transitives: null,
            recommendationRef: ''
        };

        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');

        expect(result.rhdaToResult).toHaveBeenNthCalledWith(
            1,
            expectedDependencyData1,
            manifestFilePath,
            17,
            false
        );
        
        expect(result.rhdaToResult).toHaveBeenNthCalledWith(
            2,
            expectedDependencyData2,
            manifestFilePath,
            18,
            false
        );

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('error');
    });

    it('should generate SARIF from RHDA report JSON for Docker ecosystem', async () => {
        const rhdaReportJson = {
            'node:14': {
                providers: {
                    provider1: {
                        status: { 
                            ok: true 
                        },
                        sources: {
                            source1: {
                                summary: { 
                                    critical: 1, 
                                    high: 0, 
                                    medium: 0, 
                                    low: 0 
                                },
                                dependencies: [
                                    { 
                                        ref: 'pkg:npm/log4j@1.2.17',
                                        issues: null,
                                        transitive: null,
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        };
        const ecosystem = 'docker';
        const manifestData = `
            ARG TEST_ARG=14
            FROM node:\${TEST_ARG}
            FROM --platform=linux python:3.8 as app
            FROM scratch
            # hello world
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);
        vi.mocked(result.rhdaToResult).mockReturnValue([[], []]);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );

        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');
        
        const expectedDependencyData: types.IDependencyData = {
            imageRef: 'node:14',
            depRef: 'pkg:npm/log4j@1.2.17',
            depGroup: undefined,
            depName: 'log4j',
            depVersion: '1.2.17',
            ecosystem: 'docker',
            providerId: 'provider1',
            sourceId: 'source1',
            issues:  null,
            transitives: null,
            recommendationRef: ''
        };
        expect(result.rhdaToResult).toHaveBeenCalledWith(
            expectedDependencyData,
            manifestFilePath,
            3,
            false
        );

        expect(sarifObject).toStrictEqual(mockSarif);
        expect(vulSeverity).toBe('error');
    });

    it('should generate SARIF from RHDA report JSON with no vulnerabilities', async () => {
        const rhdaReportJson = {
            scanned: {
                total: 2,
                direct: 1,
                transitive: 1
            },
            providers: {
                provider1: {
                    status: { 
                        ok: true 
                    },
                    sources: {},
                },
            },
        };
        const ecosystem = 'npm';
        const manifestData = `
            {
                "dependencies": {
                    "lodash": "1.2.3",
                }
            }
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        
        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');
 
        expect(result.rhdaToResult).toHaveBeenCalledTimes(0);

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('none');
    });

    it('should handle empty RHDA report JSON gracefully', async () => {
        const rhdaReportJson = {};
        const ecosystem = 'npm';
        const manifestData = `
            {
                "dependencies": {
                    "lodash": "1.2.3",
                }
            }
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        
        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');
 
        expect(result.rhdaToResult).toHaveBeenCalledTimes(0);

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('none');
    });

    it('should handle RHDA report JSON where a vulnerability provider has failed', async () => {
        const rhdaReportJson = {
            scanned: {
                total: 2,
                direct: 1,
                transitive: 1
            },
            providers: {
                provider1: {
                    status: { 
                        ok: false 
                    },
                    sources: {},
                },
            },
        };
        const ecosystem = 'npm';
        const manifestData = `
            {
                "dependencies": {
                    "lodash": "1.2.3",
                }
            }
        `;

        vi.mocked(fs.readFileSync).mockReturnValue(manifestData);

        const { sarifObject, vulSeverity } = await convert.generateSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        
        expect(fs.readFileSync).toHaveBeenCalledWith(manifestFilePath, 'utf-8');
 
        expect(ghCore.warning).toHaveBeenCalledWith(`The component analysis couldn't fetch data from the following providers: [provider1]`);

        expect(result.rhdaToResult).toHaveBeenCalledTimes(0);

        expect(sarifObject).toStrictEqual(mockSarif);

        expect(vulSeverity).toBe('none');
    });
});