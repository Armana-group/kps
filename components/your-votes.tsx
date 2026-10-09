"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Trash2, Vote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProcessedVote } from '@/lib/utils';
import { getVoteBudget, isVoteActive } from '@/lib/vote-budget';
import { useSubmitVote } from '@/hooks/useSubmitVote';

interface YourVotesProps {
  votes: ProcessedVote[];
  titles: Record<number, string>;
  onChange: () => void;
}

// A small button that opens every vote the connected wallet holds, including
// ones on projects that aren't listed on the page, so the 100% limit is never a surprise.
export function YourVotes({ votes, titles, onChange }: YourVotesProps) {
  const submitVote = useSubmitVote();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const now = new Date();
  const { usedPercent, remainingPercent } = getVoteBudget(votes, now);
  const listed = votes
    .filter(vote => vote.weight > 0)
    .sort((a, b) => Number(isVoteActive(b, now)) - Number(isVoteActive(a, now)) || b.weight - a.weight);

  const handleRemove = async (projectId: number) => {
    setRemovingId(projectId);
    const succeeded = await submitVote(projectId, 0);
    setRemovingId(null);
    if (succeeded) onChange();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 h-8 text-xs font-medium text-foreground/80 hover:text-foreground transition-colors">
          <Vote className="w-3.5 h-3.5 text-primary" />
          Your votes · {remainingPercent}% left
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-3">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-semibold">Your votes</p>
          <p className="text-xs text-muted-foreground">{usedPercent}% used · {remainingPercent}% left</p>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(usedPercent, 100)}%` }} />
        </div>

        {listed.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">You haven&apos;t voted on any project yet.</p>
        ) : (
          <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto">
            {listed.map(vote => {
              const active = isVoteActive(vote, now);
              return (
                <li key={vote.project_id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/projects/${vote.project_id}`} className="text-sm hover:text-primary truncate block">
                      {titles[vote.project_id] ?? `Project #${vote.project_id}`}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {active
                        ? `Expires ${vote.expiration.toLocaleDateString()}`
                        : `Expired ${vote.expiration.toLocaleDateString()}, no longer counts`}
                    </p>
                  </div>
                  <span className={`font-mono text-xs ${active ? 'font-semibold' : 'text-muted-foreground line-through'}`}>
                    {vote.weight * 5}%
                  </span>
                  <button
                    onClick={() => handleRemove(vote.project_id)}
                    disabled={removingId !== null}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent/50 disabled:opacity-50 transition-colors"
                    aria-label={`Remove vote on ${titles[vote.project_id] ?? `project #${vote.project_id}`}`}
                    title="Remove vote"
                  >
                    {removingId === vote.project_id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">
          Split up to 100% of your KOIN and VHP across projects. Votes last about 6 months.{' '}
          <Link href="/docs#voting-system" className="underline hover:text-foreground">How voting works</Link>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
