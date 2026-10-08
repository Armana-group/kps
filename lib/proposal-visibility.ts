import hiddenProposals from '../config/hidden-proposals.json';

/** Author-requested notices affect this frontend, not the fund's on-chain state. */
export function getInvalidProposal(id: number) {
  return hiddenProposals.find(proposal => proposal.id === id);
}

export function isProposalHidden(id: number): boolean {
  return getInvalidProposal(id) !== undefined;
}
