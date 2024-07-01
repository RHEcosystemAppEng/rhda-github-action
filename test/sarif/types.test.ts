import { describe, it, expect } from 'vitest';

import { IDependencyData, ISource, ISummary, IIssue, ICVSS, IRemediation, ITrustedContent} from '../../src/sarif/types'; 

describe('IDependencyData Interface', () => {
  it('should have all properties', () => {
    const dependencyData: IDependencyData = {
        imageRef: 'image:version',
        depRef: 'pkg:ecosystem/groupId/artifact@version',
        depGroup: 'groupId',
        depName: 'groupId/artifact',
        depVersion: 'version',
        ecosystem: 'ecosystem',
        providerId: 'providerId',
        sourceId: 'sourceId',
        issues:  null,
        transitives: null,
        recommendationRef: 'pkg:ecosystem/groupId/artifact@recommendedversion'
    };

    expect(dependencyData).to.have.property('imageRef');
    expect(dependencyData).to.have.property('depRef');
    expect(dependencyData).to.have.property('depGroup');
    expect(dependencyData).to.have.property('depVersion');
    expect(dependencyData).to.have.property('ecosystem');
    expect(dependencyData).to.have.property('providerId');
    expect(dependencyData).to.have.property('sourceId');
    expect(dependencyData).to.have.property('issues');
    expect(dependencyData).to.have.property('transitives');
    expect(dependencyData).to.have.property('recommendationRef');
  });
});

describe('ISource Interface', () => {
    it('should have all properties', () => {
      const source: ISource = {
          providerId: 'providerId',
          sourceId: 'sourceId',
          summary: null,
          dependencies: []
      };
  
      expect(source).to.have.property('providerId');
      expect(source).to.have.property('sourceId');
      expect(source).to.have.property('summary');
      expect(source).to.have.property('dependencies');
    });
});

describe('ISummary Interface', () => {
    it('should have all properties', () => {
      const summary: ISummary = {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
      };
  
      expect(summary).to.have.property('critical');
      expect(summary).to.have.property('high');
      expect(summary).to.have.property('medium');
      expect(summary).to.have.property('low');
    });
});

describe('IIssue Interface', () => {
    it('should have all properties', () => {
      const issue: IIssue = {
          id: 'id',
          title: 'title',
          severity: 'severity',
          cves: [],
          cvss: {cvss: ''},
          remediation: {trustedContent: null}
      };
  
      expect(issue).to.have.property('id');
      expect(issue).to.have.property('title');
      expect(issue).to.have.property('severity');
      expect(issue).to.have.property('cves');
      expect(issue).to.have.property('cvss');
      expect(issue).to.have.property('remediation');
    });
});

describe('ICVSS Interface', () => {
    it('should have all properties', () => {
      const cvss: ICVSS = {
          cvss: 'cvss'
      };
  
      expect(cvss).to.have.property('cvss');
    });
});

describe('IRemediation Interface', () => {
    it('should have all properties', () => {
      const remediation: IRemediation = {
          trustedContent: null
      };
  
      expect(remediation).to.have.property('trustedContent');
    });
});

describe('ITrustedContent Interface', () => {
    it('should have all properties', () => {
      const trustedContent: ITrustedContent = {
          ref: 'pkg:ecosystem/groupId/artifact@remediationversion'
      };
  
      expect(trustedContent).to.have.property('ref');
    });
});
