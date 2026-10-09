"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { isProposalHidden } from "@/lib/proposal-visibility";
import { YourVotes } from "@/components/your-votes";
import { HeaderSlot } from "@/components/header-slot";
import { PayoutPanel } from "@/components/payout-panel";
import { ProjectRow, ProjectRowHeader, ProjectRowSkeleton } from "@/components/project-row";
import { HowItWorks } from "@/components/how-it-works";
import { Button, ButtonArrow } from "@/components/ui/button";
import { getFundContract, getKoinContract, fetchProjects, fetchUserVotes, ProjectStatus, Project, ProcessedProject, ProcessedVote, FUND_ADDRESS } from "@/lib/utils";
import { distributePayments, estimatePayoutBudget, isInPayout, type PayoutBudget } from "@/lib/payouts";
import { formatShortDate } from "@/lib/format";
import toast from "react-hot-toast";
import { useKondorWalletContext } from "@/contexts/KondorWalletContext";

type PayoutProject = ReturnType<typeof distributePayments<ProcessedProject>>[number];

export default function Home() {
  const { address } = useKondorWalletContext();
  const [activeProjects, setActiveProjects] = useState<PayoutProject[]>([]);
  const [payouts, setPayouts] = useState<PayoutProject[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<ProcessedProject[]>([]);
  const [votes, setVotes] = useState<ProcessedVote[]>([]);
  const [voteTitles, setVoteTitles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [payoutBudget, setPayoutBudget] = useState<PayoutBudget | null>(null);
  const [nextPaymentTime, setNextPaymentTime] = useState<Date | null>(null);

  // Each load gets an id; only the latest one may update the page, so a slow
  // older load can't overwrite newer results.
  const projectsLoadId = useRef(0);
  const votesLoadId = useRef(0);

  // Fund balance, payout time and projects: loaded on arrival and refreshed in
  // place after a vote. Votes load separately, so connecting a wallet doesn't
  // reload all of this.
  const loadProjects = useCallback(async () => {
    const loadId = ++projectsLoadId.current;

    try {
      const [balanceResult, globalVarsResult, active, upcoming] = await Promise.all([
        getKoinContract().functions.balanceOf<{ value: string }>({ owner: FUND_ADDRESS }),
        getFundContract().functions.get_global_vars<{ payment_times: string[]; remaining_balance?: string }>(),
        fetchProjects(ProjectStatus.Active),
        fetchProjects(ProjectStatus.Upcoming),
      ]);
      if (loadId !== projectsLoadId.current) return;

      const balance = parseInt(balanceResult.result?.value || "0") / 1e8;
      const remainingBalance = parseInt(globalVarsResult.result?.remaining_balance || "0") / 1e8;
      const nextPaymentTimestamp = globalVarsResult.result?.payment_times[0];
      const nextPayment = nextPaymentTimestamp ? new Date(parseInt(nextPaymentTimestamp)) : null;
      const now = new Date();

      // At payout time the contract activates projects that have started and
      // retires ones that have ended, then pays in vote order from the budget
      const budget = nextPayment ? estimatePayoutBudget({ balance, remainingBalance, nextPayout: nextPayment, now }) : null;
      const inPayout = [...active, ...upcoming].filter(project => isInPayout(project, nextPayment ?? now));
      const allocated = distributePayments(inPayout, budget?.budget ?? 0, FUND_ADDRESS);

      setPayoutBudget(budget);
      setNextPaymentTime(nextPayment);
      setPayouts(allocated);
      // Hide cards after allocation: hidden proposals still compete for funds on-chain.
      setActiveProjects(allocated.filter(project => project.start_date <= now && !isProposalHidden(project.id, project.votes)));
      setUpcomingProjects(upcoming.filter(project => project.start_date > now && !isProposalHidden(project.id, project.votes)));
    } catch (error) {
      if (loadId !== projectsLoadId.current) return;
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      if (loadId === projectsLoadId.current) setLoading(false);
    }
  }, []);

  // The connected wallet's votes: loaded when the wallet changes, and after a vote.
  const loadVotes = useCallback(async () => {
    const loadId = ++votesLoadId.current;
    try {
      const processedVotes = address ? await fetchUserVotes(address) : [];
      if (loadId === votesLoadId.current) setVotes(processedVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [address]);

  const refresh = useCallback(() => {
    loadVotes();
    loadProjects();
  }, [loadVotes, loadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  // Titles for the wallet's votes. Listed projects already have theirs; the rest
  // (past or hidden projects) are fetched one at a time to stay under the RPC's burst limit.
  const listedTitles: Record<number, string> = Object.fromEntries(
    [...activeProjects, ...upcomingProjects].map(project => [project.id, project.title]),
  );
  const titles = { ...listedTitles, ...voteTitles };

  useEffect(() => {
    if (loading) return;
    const missingIds = votes.map(vote => vote.project_id).filter(id => !(id in listedTitles) && !(id in voteTitles));
    if (missingIds.length === 0) return;

    let cancelled = false;
    (async () => {
      const fund = getFundContract();
      for (const id of missingIds) {
        const { result } = await fund.functions.get_project<Project>({ project_id: id });
        if (cancelled) return;
        // Saved one by one, so a restart skips titles already fetched
        setVoteTitles(prev => ({ ...prev, [id]: result?.title ?? `Project #${id}` }));
      }
    })().catch(error => console.error("Error fetching voted project titles:", error));
    return () => { cancelled = true; };
    // listedTitles is derived from activeProjects/upcomingProjects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, votes, voteTitles, activeProjects, upcomingProjects]);

  const maxActiveVotes = Math.max(0, ...activeProjects.map(p => parseFloat(p.total_votes)));
  const maxUpcomingVotes = Math.max(0, ...upcomingProjects.map(p => parseFloat(p.total_votes)));
  const nextPayoutLabel = nextPaymentTime ? formatShortDate(nextPaymentTime) : 'the next payout';

  return (
    <div>
      {address && (
        <HeaderSlot>
          <YourVotes votes={votes} titles={titles} onChange={refresh} />
        </HeaderSlot>
      )}

      {/* Hero */}
      <section className="wrap grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-20 lg:pt-16">
        <div>
          <h1 className="max-w-[15ch] text-[40px] font-bold leading-[1.02] tracking-[-0.035em] text-balance lg:text-[56px]">
            The Koinos community decides what gets funded.
          </h1>
          <p className="mt-6 max-w-[44ch] text-[18px] leading-normal text-ink-2">
            Every month the fund pays the projects with the most support. Vote with the KOIN and VHP you already hold. Nothing is spent and nothing is locked.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#active">Vote on projects <ButtonArrow /></a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/submit">Submit a project</Link>
            </Button>
          </div>
          <p className="mt-7 text-sm text-ink-2">
            New here? <Link href="/docs" className="text-ink underline underline-offset-[3px]">Read how voting works</Link> in about three minutes.
          </p>
        </div>

        <PayoutPanel
          budget={payoutBudget}
          nextPaymentTime={nextPaymentTime}
          payouts={payouts}
          activeCount={activeProjects.length}
          upcomingCount={upcomingProjects.length}
          loading={loading}
        />
      </section>

      {/* Active */}
      <section className="wrap pt-14" id="active" aria-labelledby="active-heading">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <h2 id="active-heading" className="text-[24px] font-semibold leading-tight tracking-[-0.025em] lg:text-[28px]">Being paid now</h2>
            <p className="mt-1.5 text-[15px] text-ink-2">Open for voting. Paid on {nextPayoutLabel} in this order until that payout&apos;s budget runs out.</p>
          </div>
          <span className="hidden whitespace-nowrap text-sm text-ink-2 sm:block">Sorted by votes</span>
        </div>
        <div className="border-t border-line">
          <ProjectRowHeader kind="active" nextPaymentTime={nextPaymentTime} />
          {loading ? (
            <>
              <ProjectRowSkeleton /><ProjectRowSkeleton /><ProjectRowSkeleton />
            </>
          ) : activeProjects.length > 0 ? (
            activeProjects.map((project, i) => (
              <ProjectRow
                key={project.id}
                rank={i + 1}
                project={project}
                kind="active"
                maxVotes={maxActiveVotes}
                nextPaymentTime={nextPaymentTime}
                votes={votes}
                titles={titles}
                onVoteSuccess={refresh}
              />
            ))
          ) : (
            <EmptyList title="No projects are being paid right now" body="Submit one, or vote for an upcoming project so it is funded when it starts." />
          )}
        </div>
      </section>

      {/* Upcoming */}
      <section className="wrap pt-14" id="upcoming" aria-labelledby="upcoming-heading">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <h2 id="upcoming-heading" className="text-[24px] font-semibold leading-tight tracking-[-0.025em] lg:text-[28px]">Starting soon</h2>
            <p className="mt-1.5 text-[15px] text-ink-2">Open for voting now. Join the payout list on their start date.</p>
          </div>
          <span className="hidden whitespace-nowrap text-sm text-ink-2 sm:block">Sorted by votes</span>
        </div>
        <div className="border-t border-line">
          <ProjectRowHeader kind="upcoming" nextPaymentTime={nextPaymentTime} />
          {loading ? (
            <>
              <ProjectRowSkeleton /><ProjectRowSkeleton />
            </>
          ) : upcomingProjects.length > 0 ? (
            upcomingProjects.map((project, i) => (
              <ProjectRow
                key={project.id}
                rank={i + 1}
                project={project}
                kind="upcoming"
                maxVotes={maxUpcomingVotes}
                nextPaymentTime={nextPaymentTime}
                votes={votes}
                titles={titles}
                onVoteSuccess={refresh}
              />
            ))
          ) : (
            <EmptyList title="Nothing is waiting to start" body="New proposals show up here as soon as they are submitted." />
          )}
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}

function EmptyList({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-line py-14 text-center">
      <h3 className="text-[18px] font-semibold tracking-[-0.015em]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[44ch] text-[15px] text-ink-2">{body}</p>
    </div>
  );
}
