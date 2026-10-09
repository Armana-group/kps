// Kept free of runtime imports so the node tests can load it directly.
interface BudgetVote {
  project_id: number;
  weight: number; // 5% units, as stored by the fund contract
  expiration: Date;
}

export interface VoteBudget {
  usedPercent: number;
  remainingPercent: number;
}

export function isVoteActive(vote: BudgetVote, now: Date = new Date()): boolean {
  return vote.weight > 0 && vote.expiration >= now;
}

/**
 * How much of a wallet's vote is already given away. Pass `excludeProjectId`
 * when voting on that project: update_vote replaces its current vote.
 */
export function getVoteBudget(votes: BudgetVote[], now: Date = new Date(), excludeProjectId?: number): VoteBudget {
  const usedPercent = votes
    .filter(vote => vote.project_id !== excludeProjectId && isVoteActive(vote, now))
    .reduce((total, vote) => total + vote.weight * 5, 0);
  return { usedPercent, remainingPercent: Math.max(0, 100 - usedPercent) };
}

/**
 * Turns the fund contract's "votes have exceeded 100%" error into a plain
 * explanation. Returns null for any other error.
 */
export function explainVoteError(
  error: unknown,
  votes: BudgetVote[],
  now: Date,
  projectId: number,
  titles: Record<number, string> = {},
): string | null {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (!/exceed/i.test(message)) return null;

  const others = votes.filter(vote => vote.project_id !== projectId && isVoteActive(vote, now));
  const { usedPercent, remainingPercent } = getVoteBudget(votes, now, projectId);
  const names = others.map(vote => titles[vote.project_id] ?? `#${vote.project_id}`).join(', ');
  return `You've already given ${usedPercent}% of your vote to other projects (${names}), ` +
    `so you can give this one up to ${remainingPercent}%. Lower the percentage, or reduce one of your other votes first.`;
}
