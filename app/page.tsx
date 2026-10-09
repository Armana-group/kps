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
import { getFundContract, ProjectStatus, OrderBy, Project, Vote, ProcessedVote, FUND_ADDRESS, getKoinContract } from "@/lib/utils";
import toast from "react-hot-toast";
import { withRetry } from "@/lib/retry";
import { useKondorWalletContext } from "@/contexts/KondorWalletContext";

// Interface for processed project data
interface ProcessedProject extends Omit<Project, 'monthly_payment' | 'start_date' | 'end_date'> {
  monthly_payment: string; // Formatted with 8 decimals
  start_date: Date;
  end_date: Date;
  total_votes: string;
  vote?: ProcessedVote;
  calculatedPayment?: number; // Amount this project will receive in next payment
  paymentStatus?: 'full' | 'partial' | 'none'; // Payment status based on fund availability
}

export default function Home() {
  const pageSize = 10; // Number of projects to fetch per page
  const pageStart = "9".repeat(30); // Starting point for pagination

  const { address } = useKondorWalletContext();
  const [activeProjects, setActiveProjects] = useState<ProcessedProject[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<ProcessedProject[]>([]);
  const [votes, setVotes] = useState<ProcessedVote[]>([]);
  const [voteTitles, setVoteTitles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [fundBalance, setFundBalance] = useState<number | null>(null);
  const [nextPaymentTime, setNextPaymentTime] = useState<Date | null>(null);

  // Calculate payment distribution based on fund balance and project monthly payments
  const calculatePaymentDistribution = useCallback((projects: ProcessedProject[], availableBalance: number) => {
    if (availableBalance <= 0) {
      return projects.map(project => ({
        ...project,
        calculatedPayment: 0,
        paymentStatus: 'none' as const
      }));
    }

    let remainingBalance = availableBalance;
    const updatedProjects = [...projects];

    // Sort projects by votes (highest first) to prioritize higher-voted projects
    updatedProjects.sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes));

    for (let i = 0; i < updatedProjects.length; i++) {
      const project = updatedProjects[i];
      const monthlyPayment = parseFloat(project.monthly_payment);

      if (parseFloat(project.total_votes) === 0) {
        updatedProjects[i] = {
          ...project,
          calculatedPayment: 0,
          paymentStatus: 'none' as const
        };
      } else if (remainingBalance >= monthlyPayment) {
        // Full payment
        updatedProjects[i] = {
          ...project,
          calculatedPayment: monthlyPayment,
          paymentStatus: 'full' as const
        };
        remainingBalance -= monthlyPayment;
      } else if (remainingBalance > 0) {
        // Partial payment
        updatedProjects[i] = {
          ...project,
          calculatedPayment: remainingBalance,
          paymentStatus: 'partial' as const
        };
        remainingBalance = 0;
      } else {
        // No payment
        updatedProjects[i] = {
          ...project,
          calculatedPayment: 0,
          paymentStatus: 'none' as const
        };
      }
    }

    return updatedProjects;
  }, []);

  // Each load gets an id; only the latest one may update the page, so a slow
  // older load can't overwrite newer results.
  const projectsLoadId = useRef(0);
  const votesLoadId = useRef(0);

  // Fund balance, payout time and projects: loaded once, and again after a vote.
  // Votes load separately, so connecting a wallet doesn't reload all of this.
  const loadProjects = useCallback(async () => {
    const loadId = ++projectsLoadId.current;
    setLoading(true);
    console.log("fetching projects");

    try {
      await withRetry(async () => {
        const fund = getFundContract();
        const now = new Date();

        // fund balance
        const koin = getKoinContract();
        const { result: balanceResult } = await koin.functions.balanceOf<{ value: string }>({
          owner: FUND_ADDRESS,
        });
        const balance = parseInt(balanceResult?.value || "0") / 1e8;

        // fund global vars
        const { result: globalVarsResult } = await fund.functions.get_global_vars<{
          total_projects: number;
          total_active_projects: number;
          payment_times: string[];
        }>();
        const nextPaymentTimestamp = globalVarsResult?.payment_times[0];
        const nextPaymentTime = nextPaymentTimestamp ? new Date(parseInt(nextPaymentTimestamp)) : null;

        // Fetch active projects - 3 pages
        const allActiveProjects: Project[] = [];
        let activeStart = pageStart;
        const activePagesToFetch = 3;

        for (let page = 0; page < activePagesToFetch; page++) {
          const activeResult = await fund.functions.get_projects<{ projects: Project[]; start_next_page: string; }>({
            status: ProjectStatus.Active,
            order_by: OrderBy.Votes,
            limit: pageSize,
            start: activeStart,
            descending: true,
          });

          const projects = activeResult?.result?.projects || [];
          allActiveProjects.push(...projects);

          // Use start_next_page for the next iteration, or break if there's no next page
          const nextPageStart = activeResult?.result?.start_next_page;
          if (!nextPageStart || projects.length === 0) {
            break; // No more pages available
          }
          activeStart = nextPageStart;
        }

        const processedActiveProjects = allActiveProjects.map(project => ({
          ...project,
          monthly_payment: (parseInt(project.monthly_payment) / 1e8).toFixed(8),
          start_date: new Date(parseInt(project.start_date)),
          end_date: new Date(parseInt(project.end_date)),
          total_votes: (project.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / 20e8).toFixed(8),
        }));

        // Fetch upcoming projects - 3 pages
        const allUpcomingProjects: Project[] = [];
        let upcomingStart = pageStart;
        const upcomingPagesToFetch = 3;

        for (let page = 0; page < upcomingPagesToFetch; page++) {
          const upcomingResult = await fund.functions.get_projects<{ projects: Project[]; start_next_page: string; }>({
            status: ProjectStatus.Upcoming,
            order_by: OrderBy.Votes,
            limit: pageSize,
            start: upcomingStart,
            descending: true,
          });

          const projects = upcomingResult?.result?.projects || [];
          allUpcomingProjects.push(...projects);

          // Use start_next_page for the next iteration, or break if there's no next page
          const nextPageStart = upcomingResult?.result?.start_next_page;
          if (!nextPageStart || projects.length === 0) {
            break; // No more pages available
          }
          upcomingStart = nextPageStart;
        }

        const processedUpcomingProjects = allUpcomingProjects.map(project => ({
          ...project,
          monthly_payment: (parseInt(project.monthly_payment) / 1e8).toFixed(8),
          start_date: new Date(parseInt(project.start_date)),
          end_date: new Date(parseInt(project.end_date)),
          total_votes: (project.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / 20e8).toFixed(8),
        }));

        // Filter and move projects based on dates
        // Remove active projects that end before next payment
        const filteredActiveProjects = processedActiveProjects.filter(project => {
          if (!nextPaymentTime) return true; // Keep all if no next payment time
          return project.end_date >= nextPaymentTime;
        });

        // Move upcoming projects that have started to active list
        const projectsToMoveToActive = processedUpcomingProjects.filter(project => 
          project.start_date <= now
        );
        const remainingUpcomingProjects = processedUpcomingProjects.filter(project => 
          project.start_date > now
        );

        // Combine moved projects with active projects
        const finalActiveProjects = [...filteredActiveProjects, ...projectsToMoveToActive];

        // Sort active projects by votes (highest first)
        finalActiveProjects.sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes));

        if (loadId !== projectsLoadId.current) return;

        // Calculate payment distribution with the balance fetched above
        const projectsWithPayments = calculatePaymentDistribution(finalActiveProjects, balance);
        setFundBalance(balance);
        setNextPaymentTime(nextPaymentTime);
        // Hide cards after allocation: hidden proposals still compete for funds on-chain.
        setActiveProjects(projectsWithPayments.filter(project => !isProposalHidden(project.id, project.votes)));
        setUpcomingProjects(remainingUpcomingProjects.filter(project => !isProposalHidden(project.id, project.votes)));
      });
    } catch (error) {
      if (loadId !== projectsLoadId.current) return;
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      if (loadId === projectsLoadId.current) setLoading(false);
    }
  }, [pageSize, pageStart, calculatePaymentDistribution]);

  // The connected wallet's votes: loaded when the wallet changes, and after a vote.
  const loadVotes = useCallback(async () => {
    const loadId = ++votesLoadId.current;
    if (!address) {
      setVotes([]);
      return;
    }

    try {
      const processedVotes = await withRetry(async () => {
        const fund = getFundContract();
        const votes = await fund.functions.get_user_votes<{ votes: Vote[] }>({
          voter: address,
        });
        return (votes?.result?.votes || []).map(vote => ({
          ...vote,
          expiration: new Date(parseInt(vote.expiration) + 24 * 3600 * 1000), // add 24 hours to the expiration
        }));
      });
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
      const found: Record<number, string> = {};
      for (const id of missingIds) {
        const { result } = await fund.functions.get_project<Project>({ project_id: id });
        found[id] = result?.title ?? `Project #${id}`;
      }
      if (!cancelled) setVoteTitles(prev => ({ ...prev, ...found }));
    })().catch(error => console.error("Error fetching voted project titles:", error));
    return () => { cancelled = true; };
    // listedTitles is derived from activeProjects/upcomingProjects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, votes, voteTitles, activeProjects, upcomingProjects]);

  const withVote = (project: ProcessedProject) => ({
    ...project,
    vote: votes.find(vote => vote.project_id === project.id),
  });



  const maxActiveVotes = Math.max(0, ...activeProjects.map(p => parseFloat(p.total_votes)));
  const maxUpcomingVotes = Math.max(0, ...upcomingProjects.map(p => parseFloat(p.total_votes)));
  const nextPayoutLabel = nextPaymentTime ? nextPaymentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'the next payout';

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
            Every month the fund pays the projects with the most support. Vote with the KOIN you already hold. Nothing is spent and nothing is locked.
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
          fundBalance={fundBalance}
          nextPaymentTime={nextPaymentTime}
          activeProjects={activeProjects}
          upcomingCount={upcomingProjects.length}
          loading={loading}
        />
      </section>

      {/* Active */}
      <section className="wrap pt-14" id="active" aria-labelledby="active-heading">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <h2 id="active-heading" className="text-[24px] font-semibold leading-tight tracking-[-0.025em] lg:text-[28px]">Being paid now</h2>
            <p className="mt-1.5 text-[15px] text-ink-2">Open for voting. Paid on {nextPayoutLabel} in this order until the fund is empty.</p>
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
                project={withVote(project)}
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
                project={withVote(project)}
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
