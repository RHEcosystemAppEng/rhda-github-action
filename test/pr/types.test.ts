import { describe, it, expect } from 'vitest';
import { IPrData } from '../../src/pr/types'; 

describe('IPrData Interface', () => {
  it('should have all properties', () => {
    const prData: IPrData = {
      author: 'JohnDoe',
      number: 123,
      sha: 'abc123',
      ref: 'refs/heads/main',
      headRepo: {
        owner: 'JohnDoe',
        repo: 'test-repo',
        htmlUrl: 'https://github.com/JohnDoe/test-repo',
      },
      baseRepo: {
        owner: 'baseOwner',
        repo: 'base-repo',
        htmlUrl: 'https://github.com/baseOwner/base-repo',
      },
    };

    expect(prData).to.have.property('author');
    expect(prData).to.have.property('number');
    expect(prData).to.have.property('sha');
    expect(prData).to.have.property('ref');
    expect(prData).to.have.property('headRepo');
    expect(prData.headRepo).to.have.property('owner');
    expect(prData.headRepo).to.have.property('repo');
    expect(prData.headRepo).to.have.property('htmlUrl');
    expect(prData).to.have.property('baseRepo');
    expect(prData.baseRepo).to.have.property('owner');
    expect(prData.baseRepo).to.have.property('repo');
    expect(prData.baseRepo).to.have.property('htmlUrl');
  });
});