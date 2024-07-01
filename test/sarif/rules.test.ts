import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sarif from 'sarif';

import { fetchIssueRules, fetchRecomendationRules } from '../../src/sarif/rules'
import * as types from '../../src/sarif/types';

describe('fetchIssueRules', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return correct SARIF rule for an issue with severity LOW', () => {
        const issueData: types.IIssue = {
            id: '123',
            severity: 'LOW',
            title: 'Test Vulnerability',
            cves: ['CVE-1234'],
            cvss: { cvss: '5.0' },
            remediation: {trustedContent: null}
        };
        const directRef = 'directRef';

        const expectedRule: sarif.ReportingDescriptor = {
            id: '123',
            shortDescription: {
                text: 'LOW severity - Test Vulnerability vulnerability',
            },
            fullDescription: {
                text: 'CVE-1234',
            },
            defaultConfiguration: {
                level: 'warning',
            },
            properties: {
                tags: ['security', 'CVE-1234', 'cvss:5.0'],
            },
            help: {
                text: `Introduced through directRef`,
            },
        };

        const rule = fetchIssueRules(issueData, directRef);

        expect(rule).toEqual(expectedRule);
    });

    it('should return correct SARIF rule for an issue with severity HIGH', () => {
        const issueData: types.IIssue = {
            id: '456',
            severity: 'HIGH',
            title: 'High Vulnerability',
            cves: ['CVE-5678'],
            cvss: { cvss: '9.8' },
            remediation: {trustedContent: null}
        };
        const directRef = 'directRef';

        const expectedRule: sarif.ReportingDescriptor = {
            id: '456',
            shortDescription: {
                text: 'HIGH severity - High Vulnerability vulnerability',
            },
            fullDescription: {
                text: 'CVE-5678',
            },
            defaultConfiguration: {
                level: 'error',
            },
            properties: {
                tags: ['security', 'CVE-5678', 'cvss:9.8'],
            },
            help: {
                text: `Introduced through directRef`,
            },
        };

        const rule = fetchIssueRules(issueData, directRef);

        expect(rule).toEqual(expectedRule);
    });

    it('should return correct SARIF rule for an issue without CVEs and with CVSS', () => {
        const issueData: types.IIssue = {
            id: '789',
            severity: 'MEDIUM',
            title: 'Medium Vulnerability',
            cves: null,
            cvss: {cvss: '9.8'},
            remediation: {trustedContent: null}
        };
        const directRef = 'directRef';

        const expectedRule: sarif.ReportingDescriptor = {
            id: '789',
            shortDescription: {
                text: 'MEDIUM severity - Medium Vulnerability vulnerability',
            },
            defaultConfiguration: {
                level: 'warning',
            },
            properties: {
                tags: ['security', 'cvss:9.8'],
            },
            help: {
                text: `Introduced through directRef`,
            },
        };

        const rule = fetchIssueRules(issueData, directRef);

        expect(rule).toEqual(expectedRule);
    });

    it('should return correct SARIF rule for an issue with CVEs and without CVSS', () => {
        const issueData: types.IIssue = {
            id: '789',
            severity: 'MEDIUM',
            title: 'Medium Vulnerability',
            cves: ['CVE-5678'],
            cvss: null,
            remediation: {trustedContent: null}
        };
        const directRef = 'directRef';

        const expectedRule: sarif.ReportingDescriptor = {
            id: '789',
            shortDescription: {
                text: 'MEDIUM severity - Medium Vulnerability vulnerability',
            },
            fullDescription: {
                text: 'CVE-5678',
            },
            defaultConfiguration: {
                level: 'warning',
            },
            properties: {
                tags: ['security', 'CVE-5678'],
            },
            help: {
                text: `Introduced through directRef`,
            },
        };

        const rule = fetchIssueRules(issueData, directRef);

        expect(rule).toEqual(expectedRule);
    });

    it('should return correct SARIF rule for an issue without CVEs and CVSS', () => {
        const issueData: types.IIssue = {
            id: '789',
            severity: 'MEDIUM',
            title: 'Medium Vulnerability',
            cves: null,
            cvss: null,
            remediation: {trustedContent: null}
        };
        const directRef = 'directRef';

        const expectedRule: sarif.ReportingDescriptor = {
            id: '789',
            shortDescription: {
                text: 'MEDIUM severity - Medium Vulnerability vulnerability',
            },
            defaultConfiguration: {
                level: 'warning',
            },
            help: {
                text: `Introduced through directRef`,
            },
        };

        const rule = fetchIssueRules(issueData, directRef);

        expect(rule).toEqual(expectedRule);
    });
});

describe('fetchRecomendationRules', () => {
    it('should return correct SARIF rule for a recommendation', () => {
        const recommendation = 'pkg:ecosystem/groupId/artifact@recommendedversion';

        const expectedRule: sarif.ReportingDescriptor = {
            id: 'pkg:ecosystem/groupId/artifact@recommendedversion',
            shortDescription: {
                text: 'Red Hat recommendation',
            },
            defaultConfiguration: {
                level: 'note',
            },
        };

        const rule = fetchRecomendationRules(recommendation);

        expect(rule).toEqual(expectedRule);
    });
});