"use client";
import { useEffect, useState, useCallback } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { KoinosLogo } from "@/components/koinos-logo";
import { WalletConnect } from "@/components/wallet-connect";
import { VoteButton } from "@/components/vote-button";
import { getFundContract, ProjectStatus, OrderBy, Project, Vote, ProcessedVote, FUND_ADDRESS, getKoinContract } from "@/lib/utils";
import toast from "react-hot-toast";
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
  const [, setVotes] = useState<ProcessedVote[]>([]);
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

  const fetchFundData = useCallback(async (): Promise<void> => {
    // fund balance
    const koin = getKoinContract();
    const { result: balanceResult } = await koin.functions.balanceOf<{ value: string }>({
      owner: FUND_ADDRESS,
    });
    const balance = parseInt(balanceResult?.value || "0") / 1e8;
    setFundBalance(balance);
    
    // fund global vars
    const fund = getFundContract();
    const { result: globalVarsResult } = await fund.functions.get_global_vars<{
      total_projects: number;
      total_active_projects: number;
      payment_times: string[];
    }>();
    const nextPaymentTime = globalVarsResult?.payment_times[0];
    const nextPaymentTimeDate = nextPaymentTime ? new Date(parseInt(nextPaymentTime)) : null;
    setNextPaymentTime(nextPaymentTimeDate);
  }, []);

  const fetchVotes = useCallback(async (): Promise<ProcessedVote[]> => {
    if (!address) return [];
    const fund = getFundContract();
    const votes = await fund.functions.get_user_votes<{ votes: Vote[] }>({
      voter: address,
    });

    const processedVotes = (votes?.result?.votes || []).map(vote => ({
      ...vote,
      expiration: new Date(parseInt(vote.expiration)),
    }));console.log("processedVotes", processedVotes);

    setVotes(processedVotes);
    return processedVotes;
  }, [address]);

  const fetchProjects = useCallback(async (currentVotes: ProcessedVote[]) => {
    setLoading(true);
    const fund = getFundContract();console.log("fetching projects");
    
    try {
      // Fetch active projects
      const activeResult = await fund.functions.get_projects<{ projects: Project[] }>({
        status: ProjectStatus.Active,
        order_by: OrderBy.Votes,
        limit: pageSize,
        start: pageStart,
        descending: true,
      });
      
      const processedActiveProjects = (activeResult?.result?.projects || []).map(project => ({
        ...project,
        monthly_payment: (parseInt(project.monthly_payment) / 1e8).toFixed(8),
        start_date: new Date(parseInt(project.start_date)),
        end_date: new Date(parseInt(project.end_date)),
        total_votes: (project.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / 1e8).toFixed(8),
        vote: currentVotes.find(v => v.project_id === project.id),
      }));
      
      // Calculate payment distribution for active projects
      const projectsWithPayments = calculatePaymentDistribution(processedActiveProjects, fundBalance || 0);
      setActiveProjects(projectsWithPayments);

      // Fetch upcoming projects
      const upcomingResult = await fund.functions.get_projects<{ projects: Project[] }>({
        status: ProjectStatus.Upcoming,
        order_by: OrderBy.Votes,
        limit: pageSize,
        start: pageStart,
        descending: true,
      });
      
      const processedUpcomingProjects = (upcomingResult?.result?.projects || []).map(project => ({
        ...project,
        monthly_payment: (parseInt(project.monthly_payment) / 1e8).toFixed(8),
        start_date: new Date(parseInt(project.start_date)),
        end_date: new Date(parseInt(project.end_date)),
        total_votes: (project.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / 1e8).toFixed(8),
        vote: currentVotes.find(v => v.project_id === project.id),
      }));
      
      setUpcomingProjects(processedUpcomingProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageStart, setActiveProjects, setUpcomingProjects, calculatePaymentDistribution, fundBalance]);

  const fetchData = useCallback(async () => {
    const currentVotes = await fetchVotes();
    await fetchFundData(); // Fetch fund balance first
    await fetchProjects(currentVotes); // Then calculate payments with the balance
  }, [fetchVotes, fetchProjects, fetchFundData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("fetching votes, address:", address);
    fetchVotes().then((processedVotes) => {
      console.log("votes fetched");
      if (!processedVotes) return;
    
      setActiveProjects(prevActive => prevActive.map(project => ({
        ...project,
        vote: processedVotes.find(v => v.project_id === project.id),
      })));
    
      setUpcomingProjects(prevUpcoming => prevUpcoming.map(project => ({
        ...project,
        vote: processedVotes.find(v => v.project_id === project.id),
      })));
    });
  }, [address, fetchVotes, setActiveProjects, setUpcomingProjects]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KoinosLogo width={32} height={31} />
            <span className="text-xl font-semibold font-display">KFS</span>
          </div>
          
          <div className="flex items-center gap-4">
            <WalletConnect />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 tracking-tight">
            Koinos Fund System
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Empowering the Koinos blockchain through community-driven funding decisions. 
            Vote on projects that shape the future of decentralized innovation.
          </p>
          
          {/* Fund Stats Display */}
          <div className="inline-flex bg-card border border-border rounded-2xl px-8 py-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Fund Balance */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground font-medium">Fund Balance</p>
                  <p className="text-2xl font-bold font-mono">
                    {fundBalance !== null ? `${fundBalance.toLocaleString()} KOIN` : 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Next Payment Time */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground font-medium">Next Payment</p>
                  <p className="text-2xl font-bold font-mono">
                    {nextPaymentTime ? nextPaymentTime.toLocaleDateString() : 'Loading...'}
                  </p>
                  {nextPaymentTime && (
                    <p className="text-xs text-muted-foreground">
                      {nextPaymentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Sections */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Active Projects */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Active Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Currently running projects that are actively receiving funding and community support
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <article 
                  key={project.id} 
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Project ID Badge */}
                  <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-xs font-mono px-2 py-1 rounded-md">
                    #{project.id}
                  </div>

                  {/* Project Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                      <span>{project.total_votes} KOIN votes</span>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Payment</span>
                      <span className="font-medium">{project.monthly_payment} KOIN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {project.start_date.toLocaleDateString()} - {project.end_date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beneficiary</span>
                      <span className="font-mono text-xs truncate max-w-32" title={project.beneficiary}>
                        {project.beneficiary}
                      </span>
                    </div>
                  </div>

                  {/* Next Payment Information */}
                  {project.calculatedPayment !== undefined && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Next Payment</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          project.paymentStatus === 'full' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          project.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {project.paymentStatus === 'full' ? 'Full Payment' :
                           project.paymentStatus === 'partial' ? 'Partial Payment' : 'No Payment'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold font-mono">
                          {project.calculatedPayment.toFixed(8)} KOIN
                        </span>
                        {project.paymentStatus === 'partial' && (
                          <span className="text-xs text-muted-foreground">
                            {((project.calculatedPayment / parseFloat(project.monthly_payment)) * 100).toFixed(1)}% of requested
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vote Button */}
                  <div className="pt-4 border-t border-border">
                    <VoteButton 
                      projectId={project.id} 
                      projectTitle={project.title}
                      vote={project.vote}
                      onVoteSuccess={fetchData}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Projects</h3>
              <p className="text-muted-foreground">There are currently no active projects to display.</p>
            </div>
          )}
        </section>

        {/* Upcoming Projects */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Upcoming Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Projects that will be available for community voting in the near future
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : upcomingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingProjects.map((project) => (
                <article 
                  key={project.id} 
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Project ID Badge */}
                  <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-xs font-mono px-2 py-1 rounded-md">
                    #{project.id}
                  </div>

                  {/* Project Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Upcoming
                      </span>
                      <span>{project.total_votes} KOIN votes</span>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Payment</span>
                      <span className="font-medium">{project.monthly_payment} KOIN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">
                        {project.start_date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beneficiary</span>
                      <span className="font-mono text-xs truncate max-w-32" title={project.beneficiary}>
                        {project.beneficiary}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Upcoming Projects</h3>
              <p className="text-muted-foreground">There are currently no upcoming projects to display.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
