"use client";

import { useState, type ReactNode } from 'react';
import { Button, ButtonArrow } from '@/components/ui/button';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { ProcessedVote } from '@/lib/utils';
import { getVoteBudget, isVoteActive } from '@/lib/vote-budget';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { VoteConfirmationModal } from '@/components/vote-confirmation-modal';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  projectId: number;
  projectTitle?: string;
  /** All of the wallet's votes: this project's vote and how much is left to give. */
  votes?: ProcessedVote[];
  /** Project titles by id, used to name the other votes in error messages. */
  titles?: Record<number, string>;
  onVoteSuccess?: () => void;
  /** `row` is the compact pill in project lists; `panel` is the full-width accent pill on a project page. */
  variant?: 'row' | 'panel';
}

export function VoteButton({ projectId, projectTitle, votes = [], titles = {}, onVoteSuccess, variant = 'row' }: VoteButtonProps) {
  const { isConnected, address } = useKondorWalletContext();
  const submitVote = useSubmitVote();
  const [isVoting, setIsVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const { usedPercent: otherVotesPercent, remainingPercent } = getVoteBudget(votes, projectId);
  const vote = votes.find(v => v.project_id === projectId);
  const activeVote = vote && isVoteActive(vote, now) ? vote : undefined;
  const expiredVote = vote && vote.weight > 0 && !activeVote ? vote : undefined;

  const handleVoteClick = () => {
    if (!isConnected || !address) {
      toast.error('Connect your Kondor wallet to vote');
      return;
    }
    setIsModalOpen(true);
  };

  const handleVote = async (votePercentage: number) => {
    setIsVoting(true);
    const succeeded = await submitVote(projectId, votePercentage, votes, titles);
    setIsVoting(false);
    if (!succeeded) return;
    setJustVoted(true);
    setIsModalOpen(false);
    onVoteSuccess?.();
    setTimeout(() => setJustVoted(false), 3000);
  };

  const panel = variant === 'panel';

  let label: ReactNode;
  if (isVoting) label = <><Loader2 className="animate-spin" />Voting</>;
  else if (justVoted) label = <><Check />Voted</>;
  else if (activeVote) label = panel ? 'Change your vote' : `Voted ${activeVote.weight * 5}%`;
  else if (expiredVote) label = 'Expired · renew';
  else label = 'Vote';

  return (
    <>
      <Button
        variant={panel ? 'default' : 'outline'}
        size={panel ? 'lg' : 'sm'}
        onClick={handleVoteClick}
        disabled={isVoting}
        className={cn(
          panel ? 'w-full' : 'min-w-[88px]',
          !panel && activeVote && 'border-accent bg-accent-soft hover:border-accent',
          !panel && justVoted && 'border-ink bg-ink text-paper hover:border-ink',
        )}
      >
        {label}
        {panel && !isVoting && <ButtonArrow />}
      </Button>

      <VoteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleVote}
        projectId={projectId}
        projectTitle={projectTitle}
        currentPercentage={activeVote ? activeVote.weight * 5 : 0}
        otherVotesPercent={otherVotesPercent}
        remainingPercent={remainingPercent}
        isLoading={isVoting}
      />
    </>
  );
}
