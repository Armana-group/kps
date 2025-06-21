"use client";
import { useEffect, useState, useCallback } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { KoinosLogo } from "@/components/koinos-logo";
import { WalletConnect } from "@/components/wallet-connect";
import { VoteButton } from "@/components/vote-button";
import { getFundContract, ProjectStatus, OrderBy, Project } from "@/lib/utils";

// Interface for processed project data
interface ProcessedProject extends Omit<Project, 'monthly_payment' | 'start_date' | 'end_date'> {
  monthly_payment: string; // Formatted with 8 decimals
  start_date: Date;
  end_date: Date;
  total_votes: string;
}

export default function Home() {
  const pageSize = 10; // Number of projects to fetch per page
  const pageStart = "9".repeat(30); // Starting point for pagination

  const [activeProjects, setActiveProjects] = useState<ProcessedProject[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<ProcessedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const fund = getFundContract();
    
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
      }));
      
      setActiveProjects(processedActiveProjects);

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
      }));
      
      setUpcomingProjects(processedUpcomingProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageStart]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen relative">
      {/* Logo in top-left corner */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <KoinosLogo width={40} height={39} />
        <span className="text-2xl font-medium">KFS</span>
      </div>
      
      {/* Wallet and Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
        <WalletConnect />
        <ThemeToggle />
      </div>
      
      {/* Hero Section */}
      <div className="pt-20 pb-12 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-wider bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
          KOINOS FUND SYSTEM
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed">
          Funding projects for the Koinos blockchain. A modern platform for community-driven decision making.
        </p>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Active Projects Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Active Projects</h2>
            <p className="text-muted-foreground text-center">Currently running projects you can vote on</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  {/* Project Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-500 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">
                        {project.total_votes} votes
                      </span>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Beneficiary:</span>
                      <span className="text-muted-foreground font-mono text-xs truncate">
                        {project.beneficiary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Monthly Payment:</span>
                      <span className="text-muted-foreground">
                        {project.monthly_payment} KOIN
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Start Date:</span>
                      <span className="text-muted-foreground">
                        {project.start_date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">End Date:</span>
                      <span className="text-muted-foreground">
                        {project.end_date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Vote Button */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <VoteButton 
                      projectId={project.id} 
                      onVoteSuccess={fetchProjects}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Active Projects</h3>
              <p className="text-muted-foreground">There are currently no active projects to display.</p>
            </div>
          )}
        </div>

        {/* Upcoming Projects Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Upcoming Projects</h2>
            <p className="text-muted-foreground text-center">Projects that will be available for voting soon</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : upcomingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  {/* Project Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-500 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === ProjectStatus.Active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : project.status === ProjectStatus.Upcoming
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {ProjectStatus[project.status]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project.votes.length} votes
                      </span>
                    </div>
                  </div>

                  {/* Project Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Beneficiary:</span>
                      <span className="text-muted-foreground font-mono text-xs truncate">
                        {project.beneficiary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Monthly Payment:</span>
                      <span className="text-muted-foreground">
                        {project.monthly_payment} KOIN
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Start Date:</span>
                      <span className="text-muted-foreground">
                        {project.start_date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">End Date:</span>
                      <span className="text-muted-foreground">
                        {project.end_date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2">No Upcoming Projects</h3>
              <p className="text-muted-foreground">There are currently no upcoming projects to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
