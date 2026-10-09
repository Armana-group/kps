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

/** Whether a vote still counts toward its project's total. */
export function isVoteActive(vote: BudgetVote, now: Date = new Date()): boolean {
  return vote.weight > 0 && vote.expiration >= now;
}

/**
 * How much of a wallet's 100% is already given away. The fund contract keeps a
 * running total that only drops when a vote is set to 0, so expired votes and
 * votes on finished projects still use up the share until they are removed.
 * Pass `excludeProjectId` when voting on that project: update_vote replaces its vote.
 */
export function getVoteBudget(votes: BudgetVote[], excludeProjectId?: number): VoteBudget {
  const usedPercent = votes
    .filter(vote => vote.project_id !== excludeProjectId)
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

  const others = votes.filter(vote => vote.project_id !== projectId && vote.weight > 0);
  const { usedPercent, remainingPercent } = getVoteBudget(votes, projectId);
  const names = others.map(vote => titles[vote.project_id] ?? `#${vote.project_id}`).join(', ');
  const expiredNote = others.some(vote => !isVoteActive(vote, now))
    ? ' Expired votes still use up your share until you remove them under "Your votes".'
    : '';
  return `You've already given ${usedPercent}% of your vote to other projects (${names}), ` +
    `so you can give this one up to ${remainingPercent}%. Lower the percentage, or reduce one of your other votes first.` +
    expiredNote;
}
