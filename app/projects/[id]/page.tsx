"use client";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VoteButton } from "@/components/vote-button";
import { Button } from "@/components/ui/button";
import { formatDate, formatKoin } from "@/lib/format";
import { getFundContract, ProjectStatus, Project, ProcessedVote, Vote } from "@/lib/utils";
import toast from "react-hot-toast";
import { useKondorWalletContext } from "@/contexts/KondorWalletContext";
import Link from "next/link";
import { ProposalNotice } from "@/components/proposal-notice";
import { getProposalNotice } from "@/lib/proposal-visibility";

interface ProcessedProject extends Omit<Project, 'monthly_payment' | 'start_date' | 'end_date'> {
  monthly_payment: string;
  start_date: Date;
  end_date: Date;
  total_votes: string;
  vote?: ProcessedVote;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { address } = useKondorWalletContext();
  const [project, setProject] = useState<ProcessedProject | null>(null);
  const [votes, setVotes] = useState<ProcessedVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = typeof params.id === 'string' ? parseInt(params.id) : null;

  const fetchVote = useCallback(async (): Promise<ProcessedVote | undefined> => {
    if (!address || !projectId) return undefined;
    
    const fund = getFundContract();
    const votes = await fund.functions.get_user_votes<{ votes: Vote[] }>({
      voter: address,
    });

    const processedVotes = (votes?.result?.votes || []).map(vote => ({
      ...vote,
      expiration: new Date(parseInt(vote.expiration) + 24 * 3600 * 1000), // add 24 hours to the expiration
    }));

    setVotes(processedVotes);
    return processedVotes.find(v => v.project_id === projectId);
  }, [address, projectId]);

  const fetchProject = useCallback(async () => {
    if (!projectId || isNaN(projectId)) {
      setError("Invalid project ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const fund = getFundContract();

    try {
      const result = await fund.functions.get_project<Project>({
        project_id: projectId,
      });

      if (!result?.result) {
        setError("Project not found");
        setLoading(false);
        return;
      }

      const projectData = result.result;
      const userVote = await fetchVote();

      const processedProject: ProcessedProject = {
        ...projectData,
        monthly_payment: (parseInt(projectData.monthly_payment) / 1e8).toFixed(8),
        start_date: new Date(parseInt(projectData.start_date)),
        end_date: new Date(parseInt(projectData.end_date)),
        total_votes: (projectData.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / 20e8).toFixed(8),
        vote: userVote,
      };

      setProject(processedProject);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project. Please try again.");
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId, fetchVote]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!projectId) return;
    
    fetchVote().then((vote) => {
      if (vote && project) {
        setProject(prev => prev ? { ...prev, vote } : null);
      }
    });
  }, [address, projectId, fetchVote, project?.id]); // Use project.id to avoid infinite loop

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
  const activeVote = project.vote && project.vote.weight > 0 && project.vote.expiration >= now ? project.vote : undefined;
  const expiredVote = project.vote && project.vote.weight > 0 && project.vote.expiration < now ? project.vote : undefined;

  // Votes grouped by the month they expire in, oldest first; empty months are skipped
  const expiryBuckets = project.votes
    .map((raw, index) => ({ months: index + 1, amount: parseInt(raw) / 20e8 }))
    .filter(bucket => bucket.amount > 0);
  const maxBucket = Math.max(0, ...expiryBuckets.map(b => b.amount));
  const paymentCount = Math.max(0, countMonthEnds(project.start_date, project.end_date));
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
            {paragraphs.map((text, i) => <p key={i} className="whitespace-pre-wrap break-words">{linkify(text)}</p>)}
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
                  ? `All of it expires in ${expiryBuckets[0].months} month${expiryBuckets[0].months === 1 ? '' : 's'}.`
                  : 'Votes expire in the months below unless renewed.'}
            </p>

            {expiryBuckets.length > 0 && (
              <div className="mt-6 grid gap-2.5" aria-label="Votes by expiry">
                {expiryBuckets.map(bucket => (
                  <div key={bucket.months} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                    <span className="text-ink-2">Expires in {bucket.months} month{bucket.months === 1 ? '' : 's'}</span>
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
                Your {expiredVote.weight * 5}% vote expired {formatDate(expiredVote.expiration)} and no longer counts. Vote again to renew it.
              </div>
            )}

            <div className="mt-5">
              <VoteButton
                variant="panel"
                projectId={project.id}
                projectTitle={project.title}
                vote={project.vote}
                votes={votes}
                titles={{ [project.id]: project.title }}
                onVoteSuccess={fetchProject}
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

/** Month-end payouts between two dates, inclusive of an end that lands on a month end. */
function countMonthEnds(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
  while (cursor <= end) {
    count++;
    cursor.setMonth(cursor.getMonth() + 2, 0);
  }
  return count;
}

/** Turns bare http(s) URLs in proposal text into links. */
function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s)]+)/g).map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noreferrer" className="underline underline-offset-[3px] decoration-1 break-all">{part.replace(/^https?:\/\//, '')}</a>
      : part
  );
}
