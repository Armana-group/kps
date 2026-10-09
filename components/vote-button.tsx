"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { ProcessedVote } from '@/lib/utils';
import { getVoteBudget } from '@/lib/vote-budget';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import { ThumbsUp, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { VoteConfirmationModal } from '@/components/vote-confirmation-modal';

interface VoteButtonProps {
  projectId: number;
  projectTitle?: string;
  vote?: ProcessedVote;
  /** All of the wallet's votes, so the modal can show how much is left to give. */
  votes?: ProcessedVote[];
  /** Project titles by id, used to name the other votes in error messages. */
  titles?: Record<number, string>;
  onVoteSuccess?: () => void;
}

export function VoteButton({ projectId, projectTitle, vote, votes = [], titles = {}, onVoteSuccess }: VoteButtonProps) {
  const { isConnected, address } = useKondorWalletContext();
  const submitVote = useSubmitVote();
  const [isVoting, setIsVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const { usedPercent: otherVotesPercent, remainingPercent } = getVoteBudget(votes, now, projectId);

  const handleVoteClick = () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsModalOpen(true);
  };

  const handleVote = async (votePercentage: number) => {
    setIsVoting(true);
    const succeeded = await submitVote(projectId, votePercentage, votes, titles);
    setIsVoting(false);
    if (!succeeded) return;

    // Show success state
    setJustVoted(true);

    // Close the modal
    setIsModalOpen(false);

    // Call the success callback to refresh data
    if (onVoteSuccess) {
      onVoteSuccess();
    }

    // Reset the success state after 3 seconds
    setTimeout(() => {
      setJustVoted(false);
    }, 3000);
  };

  // Helper function to format expiration date
  const formatExpiration = (expiration: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((expiration.getTime() - now.getTime()) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  // Determine button state and styling
  const getButtonState = () => {
    if (!isConnected) {
      return {
        variant: "outline" as const,
        className: "w-full h-11 rounded-xl font-medium text-sm border-border hover:border-border",
        icon: <ThumbsUp className="w-4 h-4 mr-2" />,
        text: "Connect Wallet to Vote",
        disabled: true
      };
    }

    if (isVoting) {
      return {
        variant: "default" as const,
        className: "w-full h-11 rounded-xl font-medium text-sm bg-muted text-muted-foreground",
        icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
        text: "Voting...",
        disabled: true
      };
    }

    if (justVoted) {
      return {
        variant: "default" as const,
        className: "w-full h-11 rounded-xl font-medium text-sm bg-green-500 hover:bg-green-500 text-white",
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        text: "Vote Submitted!",
        disabled: true
      };
    }

    if (vote) {
      if (vote.expiration < now) {
        // Expired vote - orange styling
        return {
          variant: "default" as const,
          className: "w-full h-11 rounded-xl font-medium text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md",
          icon: <AlertTriangle className="w-4 h-4 mr-2" />,
          text: `Expired - Renew Vote`,
          disabled: false
        };
      } else {
        // Active vote - green styling
        return {
          variant: "default" as const,
          className: "w-full h-11 rounded-xl font-medium text-sm bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md",
          icon: <ThumbsUp className="w-4 h-4 mr-2" />,
          text: `Voted (${vote.weight * 5}%) - Expires in ${formatExpiration(vote.expiration)}`,
          disabled: false
        };
      }
    }

    // No vote - primary styling
    return {
      variant: "default" as const,
      className: "w-full h-11 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md",
      icon: <ThumbsUp className="w-4 h-4 mr-2" />,
      text: "Vote for Project",
      disabled: false
    };
  };

  const buttonState = getButtonState();

  return (
    <>
      <Button
        variant={buttonState.variant}
        onClick={handleVoteClick}
        disabled={buttonState.disabled}
        className={buttonState.className}
      >
        {buttonState.icon}
        {buttonState.text}
      </Button>

      <VoteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleVote}
        projectId={projectId}
        projectTitle={projectTitle}
        currentPercentage={vote && vote.expiration >= now ? vote.weight * 5 : 0}
        otherVotesPercent={otherVotesPercent}
        remainingPercent={remainingPercent}
        isLoading={isVoting}
      />
    </>
  );
}