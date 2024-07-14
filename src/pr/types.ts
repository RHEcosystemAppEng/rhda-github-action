/**
 * Represents data specification related to a pull request.
 */
export interface IPrData {
    author: string | undefined;
    number: number;
    sha: string;
    ref: string;
    /**
     * The forked repo that the PR is coming from
     */
    headRepo: {
        owner: string;
        repo: string;
        htmlUrl: string;
    };
    /**
     * The upstream repo that the PR wants to merge into
     */
    baseRepo: {
        owner: string;
        repo: string;
        htmlUrl: string;
    };
}
