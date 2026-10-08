import configuredNotices from '../config/proposal-notices.json';

export interface ProposalNoticeConfig {
  id: number;
  hideWhenNoVotes: boolean;
  muted: boolean;
  notice: {
    title: string;
    summary: string;
    details?: string;
  };
}

const proposalNotices: ProposalNoticeConfig[] = configuredNotices;

/** Notices affect this frontend, not the fund's on-chain state. */
export function getProposalNotice(id: number): ProposalNoticeConfig | undefined {
  return proposalNotices.find(proposal => proposal.id === id);
}

export function getProposalNoticeText(notice: ProposalNoticeConfig['notice'], variant: 'compact' | 'detail'): string {
  return variant === 'detail' && notice.details?.trim() ? notice.details : notice.summary;
}

export function isProposalHidden(id: number, votes: readonly string[]): boolean {
  // Use raw vote units: even one unit must keep a configured notice visible.
  return getProposalNotice(id)?.hideWhenNoVotes === true && !votes.some(vote => BigInt(vote) > BigInt(0));
}
