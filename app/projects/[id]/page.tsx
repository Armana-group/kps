"use client";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VoteButton } from "@/components/vote-button";
import { Button } from "@/components/ui/button";
import { formatDate, formatKoin, formatShortDate } from "@/lib/format";
import { getFundContract, fetchUserVotes, toProcessedProject, voteUnitsToKoin, ProjectStatus, Project, ProcessedProject, ProcessedVote } from "@/lib/utils";
import { isVoteActive } from "@/lib/vote-budget";
import { countPayouts } from "@/lib/payouts";
import toast from "react-hot-toast";
import { useKondorWalletContext } from "@/contexts/KondorWalletContext";
import Link from "next/link";
import { ProposalNotice } from "@/components/proposal-notice";
import { getProposalNotice } from "@/lib/proposal-visibility";
import { splitTextLinks } from "@/lib/text-links";

export default function ProjectDetailPage() {
  const params = useParams();
  const { address } = useKondorWalletContext();
  const [project, setProject] = useState<ProcessedProject | null>(null);
  const [votes, setVotes] = useState<ProcessedVote[]>([]);
  const [paymentTimes, setPaymentTimes] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = typeof params.id === 'string' ? parseInt(params.id) : null;

  // The project itself: loaded on arrival and refreshed in place after a vote
  const loadProject = useCallback(async () => {
    if (!projectId || isNaN(projectId)) {
      setError("Invalid project ID");
      setLoading(false);
      return;
    }

    try {
      const fund = getFundContract();
      const [{ result }, { result: globalVars }] = await Promise.all([
        fund.functions.get_project<Project>({ project_id: projectId }),
        fund.functions.get_global_vars<{ payment_times: string[] }>(),
      ]);
      setPaymentTimes((globalVars?.payment_times ?? []).map(time => new Date(parseInt(time))));
      if (result) {
        setProject(toProcessedProject(result));
        setError(null);
      } else {
        setError("Project not found");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project. Please try again.");
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // The connected wallet's votes, loaded separately so connecting a wallet doesn't reload the project
  const loadVotes = useCallback(async () => {
    try {
      setVotes(address ? await fetchUserVotes(address) : []);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [address]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  const refresh = () => {
    loadVotes();
    loadProject();
  };

  const statusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active: return "Active";
      case ProjectStatus.Upcoming: return "Starting soon";
      case ProjectStatus.Past: return "Ended";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="wrap pt-10">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-panel-strong" />
          <div className="mt-12 h-10 w-2/3 rounded bg-panel-strong" />
          <div className="mt-6 h-4 w-1/2 rounded bg-panel" />
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full rounded bg-panel" />
            <div className="h-4 w-11/12 rounded bg-panel" />
            <div className="h-4 w-3/4 rounded bg-panel" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="wrap flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Project not found</h1>
        <p className="mt-2 max-w-[40ch] text-ink-2">{error || "There is no project with this id."}</p>
        <Button variant="outline" className="mt-7" asChild>
          <Link href="/"><ArrowLeft />All projects</Link>
        </Button>
      </div>
    );
  }

  const proposalNotice = getProposalNotice(project.id);
  const now = new Date();
  const totalVotes = parseFloat(project.total_votes);
  const vote = votes.find(v => v.project_id === project.id);
  const activeVote = vote && isVoteActive(vote, now) ? vote : undefined;
  const expiredVote = vote && vote.weight > 0 && !activeVote ? vote : undefined;

  // Votes grouped by the payout they expire after (votes[i] counts through
  // payment_times[i]), soonest first; empty ones are skipped. A finished
  // project's votes no longer move, so it gets no breakdown.
  const expiryBuckets = project.status === ProjectStatus.Past ? [] : project.votes
    .map((raw, index) => ({ index, payout: paymentTimes[index], amount: voteUnitsToKoin(raw) }))
    .filter(bucket => bucket.amount > 0);
  const maxBucket = Math.max(0, ...expiryBuckets.map(b => b.amount));
  const paymentCount = countPayouts(project.start_date, project.end_date);
  const paragraphs = project.description.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="wrap">
      <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink">
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        All projects
      </Link>

      <div className="grid items-start gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div>
          {proposalNotice && <ProposalNotice notice={proposalNotice.notice} />}

          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-2">
            <i className="size-2 rounded-full bg-accent" aria-hidden="true" />
            {statusText(project.status)}
          </span>
          <h1 className="mt-3.5 max-w-[20ch] text-[32px] font-bold leading-[1.06] tracking-[-0.03em] text-balance lg:text-[44px]">
            {project.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-ink-2">
            <span>Project <b className="font-medium tabular-nums text-ink">#{project.id}</b></span>
            <span>Asks <b className="font-medium tabular-nums text-ink">{formatKoin(project.monthly_payment)} KOIN</b> a month</span>
            <span>{formatDate(project.start_date)} to {formatDate(project.end_date)}</span>
          </div>

          <div className="mt-10 max-w-[62ch] space-y-4 text-[17px] leading-[1.6]">
            {paragraphs.map((text, i) => <p key={i} className="whitespace-pre-wrap [overflow-wrap:anywhere]">{linkify(text)}</p>)}
          </div>

          <dl className="mt-12 border-t border-line text-[15px]">
            <Fact label="Monthly ask"><span className="tabular-nums">{formatKoin(project.monthly_payment)} KOIN</span></Fact>
            <Fact label="Runs">{formatDate(project.start_date)} to {formatDate(project.end_date)}{paymentCount > 0 && <> · {paymentCount} payment{paymentCount === 1 ? '' : 's'}</>}</Fact>
            <Fact label="Beneficiary"><a className="mono break-all hover:underline" href={`https://koinscan.com/address/${project.beneficiary}`} target="_blank" rel="noreferrer">{project.beneficiary}</a></Fact>
            <Fact label="Created by"><a className="mono break-all hover:underline" href={`https://koinscan.com/address/${project.creator}`} target="_blank" rel="noreferrer">{project.creator}</a></Fact>
          </dl>
        </div>

        <aside className="lg:sticky lg:top-[100px]">
          <div className="rounded-[22px] bg-panel p-6 lg:rounded-[28px] lg:p-7">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Votes</h2>
            <div className="mt-5 text-[36px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
              {formatKoin(totalVotes)}<small className="ml-1.5 text-[16px] font-medium tracking-normal text-ink-2">KOIN</small>
            </div>
            <p className="mt-2 text-sm text-ink-2">
              {totalVotes === 0
                ? 'No votes yet. The first vote puts this project on the payout list.'
                : expiryBuckets.length === 1
                  ? expiryBuckets[0].payout
                    ? `All of it counts through the ${formatShortDate(expiryBuckets[0].payout)} payout, then expires unless renewed.`
                    : 'All of it expires at the same payout unless renewed.'
                  : 'Votes expire after the payouts below unless renewed.'}
            </p>

            {expiryBuckets.length > 0 && (
              <div className="mt-6 grid gap-2.5" aria-label="Votes by expiry">
                {expiryBuckets.map(bucket => (
                  <div key={bucket.index} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                    <span className="text-ink-2">{bucket.payout ? `Counts through the ${formatShortDate(bucket.payout)} payout` : `Payout ${bucket.index + 1} from now`}</span>
                    <b className="font-semibold tabular-nums">{formatKoin(bucket.amount)}</b>
                    <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-panel-strong" aria-hidden="true">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${maxBucket > 0 ? (bucket.amount / maxBucket) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeVote && (
              <div className="mt-6 rounded-2xl bg-accent-soft px-4 py-3.5 text-sm leading-snug">
                You gave this project <b className="font-semibold">{activeVote.weight * 5}%</b> of your vote. It expires {formatDate(activeVote.expiration)}.
              </div>
            )}
            {expiredVote && (
              <div className="mt-6 rounded-2xl bg-panel-strong px-4 py-3.5 text-sm leading-snug text-ink-2">
                Your {expiredVote.weight * 5}% vote expired {formatDate(expiredVote.expiration)}. It no longer counts for this project but still uses {expiredVote.weight * 5}% of your share. Vote again to renew it, or remove it.
              </div>
            )}

            <div className="mt-5">
              <VoteButton
                variant="panel"
                projectId={project.id}
                projectTitle={project.title}
                votes={votes}
                titles={{ [project.id]: project.title }}
                onVoteSuccess={refresh}
              />
            </div>
            <p className="mt-3.5 text-center text-[13px] text-ink-2">Voting signs one transaction in Kondor. Nothing is spent.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid border-b border-line py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="mt-0.5 min-w-0 font-medium sm:mt-0">{children}</dd>
    </div>
  );
}

/** Turns http(s) and www. URLs in proposal text into links, leaving trailing punctuation outside. */
function linkify(text: string): ReactNode[] {
  return splitTextLinks(text).map((part, i) =>
    part.href
      ? <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] decoration-1">{part.text.replace(/^https?:\/\//, '')}</a>
      : part.text
  );
}
