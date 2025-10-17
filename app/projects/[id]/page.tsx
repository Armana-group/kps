"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { VoteButton } from "@/components/vote-button";
import { getFundContract, ProjectStatus, Project, ProcessedVote, Vote } from "@/lib/utils";
import toast from "react-hot-toast";
import { useKondorWalletContext } from "@/contexts/KondorWalletContext";
import Link from "next/link";

interface ProcessedProject extends Omit<Project, 'monthly_payment' | 'start_date' | 'end_date'> {
  monthly_payment: string;
  start_date: Date;
  end_date: Date;
  total_votes: string;
  vote?: ProcessedVote;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useKondorWalletContext();
  const [project, setProject] = useState<ProcessedProject | null>(null);
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
      expiration: new Date(parseInt(vote.expiration)),
    }));

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

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return "bg-green-500";
      case ProjectStatus.Upcoming:
        return "bg-blue-500";
      case ProjectStatus.Past:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return "Active";
      case ProjectStatus.Upcoming:
        return "Upcoming";
      case ProjectStatus.Past:
        return "Past";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The project you're looking for doesn't exist."}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Project Header */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Title and Status */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold font-display">{project.title}</h1>
              <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full whitespace-nowrap">
                <div className={`w-2 h-2 ${getStatusColor(project.status)} rounded-full`}></div>
                {getStatusText(project.status)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-mono">Project ID:</span>
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">#{project.id}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>

          {/* Project Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Financial Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-mono font-semibold">{project.monthly_payment} KOIN</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Total Votes</span>
                  <span className="font-mono font-semibold">{project.total_votes} KOIN</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{project.start_date.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">{project.end_date.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold">Addresses</h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-sm mb-1">Creator</div>
                <div className="font-mono text-sm break-all">{project.creator}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground text-sm mb-1">Beneficiary</div>
                <div className="font-mono text-sm break-all">{project.beneficiary}</div>
              </div>
            </div>
          </div>

          {/* Vote Distribution */}
          {project.votes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Vote Distribution by Expiration</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Votes grouped by expiration timeline (up to 6 months)
                </div>
                <div className="space-y-2">
                  {project.votes.map((vote, index) => {
                    const voteAmount = (parseInt(vote) / 20e8).toFixed(2);
                    const monthsUntilExpiration = index + 1;
                    const hasVotes = parseInt(vote) > 0;
                    
                    if (!hasVotes) return null;
                    
                    return (
                      <div key={index} className="flex items-center justify-between bg-card border border-border px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                            {monthsUntilExpiration}
                          </div>
                          <div>
                            <div className="font-medium">
                              {monthsUntilExpiration} month{monthsUntilExpiration !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Expires in {monthsUntilExpiration} month{monthsUntilExpiration !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold">{voteAmount} KOIN</div>
                          <div className="text-xs text-muted-foreground">
                            {((parseFloat(voteAmount) / parseFloat(project.total_votes)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* User's Vote Status */}
          {project.vote && (
            <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold mb-1">You have voted on this project</div>
                  <div className="text-sm text-muted-foreground">
                    Weight: {project.vote.weight}% • Expires: {project.vote.expiration.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vote Button */}
          <div className="pt-6 border-t border-border">
            <VoteButton
              projectId={project.id}
              projectTitle={project.title}
              vote={project.vote}
              onVoteSuccess={fetchProject}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

