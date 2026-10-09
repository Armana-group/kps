"use client";

import Link from 'next/link';
import { VoteButton } from '@/components/vote-button';
import { ProposalNotice } from '@/components/proposal-notice';
import { getProposalNotice } from '@/lib/proposal-visibility';
import { ProcessedVote } from '@/lib/utils';
import { formatDate, formatKoin } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface RowProject {
  id: number;
  title: string;
  description: string;
  total_votes: string;
  monthly_payment: string;
  start_date: Date;
  end_date: Date;
  vote?: ProcessedVote;
  calculatedPayment?: number;
  paymentStatus?: 'full' | 'partial' | 'none';
}

interface ProjectRowProps {
  rank: number;
  project: RowProject;
  kind: 'active' | 'upcoming';
  /** Highest vote total in the list, so the bars are relative. */
  maxVotes: number;
  nextPaymentTime: Date | null;
  votes: ProcessedVote[];
  titles: Record<number, string>;
  onVoteSuccess: () => void;
}

// The grid is shared by the header row and every project row so columns line up.
export const rowGrid = 'lg:grid lg:grid-cols-[44px_minmax(0,1fr)_190px_150px_170px_104px] lg:items-center lg:gap-6';

export function ProjectRowHeader({ kind, nextPaymentTime }: { kind: 'active' | 'upcoming'; nextPaymentTime: Date | null }) {
  return (
    <div className={cn('hidden py-3 text-[13px] text-ink-2', rowGrid)} aria-hidden="true">
      <span />
      <span>Project</span>
      <span className="text-right">Votes (KOIN)</span>
      <span className="text-right">Asks per month</span>
      <span className="text-right">
        {kind === 'active' ? (nextPaymentTime ? `Gets on ${formatDate(nextPaymentTime).replace(/, \d{4}$/, '')}` : 'Next payout') : 'Starts'}
      </span>
      <span />
    </div>
  );
}

export function ProjectRow({ rank, project, kind, maxVotes, nextPaymentTime, votes, titles, onVoteSuccess }: ProjectRowProps) {
  const notice = getProposalNotice(project.id);
  const muted = notice?.muted === true;
  const totalVotes = parseFloat(project.total_votes);
  const barWidth = maxVotes > 0 ? Math.max(0, Math.min(100, (totalVotes / maxVotes) * 100)) : 0;
  const monthly = parseFloat(project.monthly_payment);

  // Third column: what the project gets at the next payout (active) or when it starts (upcoming)
  let third: { main: string; sub: string; dim: boolean };
  if (kind === 'upcoming') {
    third = { main: formatDate(project.start_date), sub: `Until ${formatDate(project.end_date)}`, dim: false };
  } else if (project.paymentStatus === 'full') {
    third = { main: formatKoin(project.calculatedPayment ?? 0), sub: 'Full payment', dim: false };
  } else if (project.paymentStatus === 'partial') {
    const share = monthly > 0 ? ((project.calculatedPayment ?? 0) / monthly) * 100 : 0;
    third = { main: formatKoin(project.calculatedPayment ?? 0), sub: `Partial, ${share < 1 ? share.toFixed(1) : Math.round(share)}% of ask`, dim: false };
  } else {
    third = { main: '0', sub: totalVotes === 0 ? 'No votes yet' : 'Fund runs out first', dim: true };
  }

  return (
    <article className={cn('border-t border-line py-6', rowGrid, 'flex flex-col gap-3.5')}>
      <div className="flex gap-4 lg:contents">
        <span className={cn('w-7 shrink-0 pt-0.5 text-[15px] font-medium tabular-nums lg:w-auto lg:pt-0', muted ? 'text-ink-3' : 'text-ink-3')}>{rank}</span>
        <div className="min-w-0 flex-1">
          <h3 className={cn('text-[18px] font-semibold leading-snug tracking-[-0.015em]', muted && 'text-ink-3')}>
            <Link href={`/projects/${project.id}`} className="hover:underline hover:underline-offset-[3px] hover:decoration-1">
              {project.title}
            </Link>
          </h3>
          {notice ? (
            <ProposalNotice notice={notice.notice} variant="compact" />
          ) : (
            <p className="mt-1 line-clamp-2 max-w-[60ch] text-sm leading-relaxed text-ink-2">{project.description}</p>
          )}
        </div>
      </div>

      <div className={cn('flex items-end justify-between gap-6 pl-11 lg:contents lg:pl-0')}>
        <div className="min-w-[120px] text-left lg:text-right">
          <b className={cn('block text-[15px] font-semibold tabular-nums', muted && 'text-ink-3')}>{formatKoin(totalVotes)}</b>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-panel-strong" aria-hidden="true">
            <div className={cn('h-full rounded-full', muted ? 'bg-ink-3' : 'bg-ink')} style={{ width: `${barWidth}%` }} />
          </div>
        </div>
        <div className="hidden text-right text-[15px] lg:block">
          <b className={cn('block font-semibold tabular-nums', muted && 'text-ink-3')}>{formatKoin(monthly)}</b>
        </div>
        <div className="hidden text-right text-[15px] lg:block">
          <b className={cn('block tabular-nums', third.dim ? 'font-medium text-ink-3' : 'font-semibold', muted && 'text-ink-3')}>{third.main}</b>
          <small className="mt-0.5 block text-[13px] text-ink-2">{third.sub}</small>
        </div>
        <div className="flex justify-end">
          <VoteButton
            projectId={project.id}
            projectTitle={project.title}
            vote={project.vote}
            votes={votes}
            titles={titles}
            onVoteSuccess={onVoteSuccess}
          />
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-7 gap-y-1 pl-11 text-sm text-ink-2 lg:hidden">
        <div>Asks <b className="font-medium tabular-nums text-ink">{formatKoin(monthly)}</b> / month</div>
        <div>
          {kind === 'active' ? 'Gets ' : 'Starts '}
          <b className={cn('font-medium tabular-nums', third.dim ? 'text-ink-3' : 'text-ink')}>{third.main}</b>
          {kind === 'active' && nextPaymentTime ? ` on ${formatDate(nextPaymentTime).replace(/, \d{4}$/, '')}` : ''}
        </div>
      </dl>
    </article>
  );
}

export function ProjectRowSkeleton() {
  return (
    <div className="animate-pulse border-t border-line py-6">
      <div className="h-5 w-2/5 rounded bg-panel-strong" />
      <div className="mt-3 h-4 w-3/5 rounded bg-panel" />
    </div>
  );
}
