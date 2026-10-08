import hiddenProposals from '../config/hidden-proposals.json';

/** Author-requested notices affect this frontend, not the fund's on-chain state. */
export function getInvalidProposal(id: number) {
  return hiddenProposals.find(proposal => proposal.id === id);
}

export function isProposalHidden(id: number, votes: readonly string[]): boolean {
  // Use raw vote units: even one unit must keep the author's unvote request visible.
  return getInvalidProposal(id) !== undefined && !votes.some(vote => BigInt(vote) > BigInt(0));
}
