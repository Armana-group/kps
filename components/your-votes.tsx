"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProcessedVote } from '@/lib/utils';
import { getVoteBudget, isVoteActive } from '@/lib/vote-budget';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface YourVotesProps {
  votes: ProcessedVote[];
  titles: Record<number, string>;
  onChange: () => void;
}

// A header control that opens every vote the connected wallet holds, including
// ones on projects that aren't listed on the page, so the 100% limit is never a surprise.
export function YourVotes({ votes, titles, onChange }: YourVotesProps) {
  const submitVote = useSubmitVote();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const now = new Date();
  const { usedPercent, remainingPercent } = getVoteBudget(votes);
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
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2.5 rounded-full border border-line-strong pl-4 pr-3.5 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          <span className="hidden sm:inline">Your votes</span>
          <span aria-hidden="true" className="h-1 w-11 overflow-hidden rounded-full bg-panel-strong">
            <span className="block h-full bg-accent" style={{ width: `${Math.min(usedPercent, 100)}%` }} />
          </span>
          <span className="tabular-nums">{usedPercent}% used</span>
          <ChevronDown className="size-3 text-ink-2" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-[340px] rounded-[20px] border-line p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,.25)]">
        <div className="flex items-baseline justify-between">
          <p className="text-[16px] font-semibold tracking-[-0.01em]">Your votes</p>
          <p className="text-[13px] tabular-nums text-ink-2">{usedPercent}% used · {remainingPercent}% left</p>
        </div>
        <div className="mb-1.5 mt-2.5 h-1.5 overflow-hidden rounded-full bg-panel-strong" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(usedPercent, 100)}%` }} />
        </div>

        {listed.length === 0 ? (
          <p className="py-3 text-sm text-ink-2">You haven&apos;t voted on any project yet.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto">
            {listed.map(vote => {
              const active = isVoteActive(vote, now);
              const title = titles[vote.project_id] ?? `Project #${vote.project_id}`;
              return (
                <li key={vote.project_id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
                  <div className="min-w-0 flex-1">
                    <Link href={`/projects/${vote.project_id}`} className="block truncate text-[15px] font-medium hover:underline hover:underline-offset-[3px]">
                      {title}
                    </Link>
                    <p className="text-[13px] text-ink-2">
                      {active
                        ? `Expires ${formatDate(vote.expiration)}`
                        : `Expired ${formatDate(vote.expiration)}. Still uses ${vote.weight * 5}% until removed`}
                    </p>
                  </div>
                  <span className={cn('text-[15px] font-semibold tabular-nums', !active && 'text-ink-2')}>
                    {vote.weight * 5}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(vote.project_id)}
                    disabled={removingId !== null}
                    className="grid size-7 place-items-center rounded-full text-ink-3 transition-colors hover:bg-panel hover:text-ink disabled:opacity-50"
                    aria-label={`Remove vote on ${title}`}
                    title="Remove vote"
                  >
                    {removingId === vote.project_id
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <X className="size-3.5" strokeWidth={1.8} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-2 border-t border-line pt-3 text-[13px] leading-snug text-ink-2">
          Split up to 100% of your KOIN and VHP across projects. Votes last about six months.{' '}
          <Link href="/docs#voting-system" className="underline underline-offset-[3px] hover:text-ink">How voting works</Link>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
