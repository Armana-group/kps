"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { getFundContract, ProcessedVote } from '@/lib/utils';
import { ThumbsUp, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ProviderInterface, SignerInterface } from 'koilib';
import toast from 'react-hot-toast';
import { VoteConfirmationModal } from '@/components/vote-confirmation-modal';

interface VoteButtonProps {
  projectId: number;
  projectTitle?: string;
  vote?: ProcessedVote;
  onVoteSuccess?: () => void;
}

export function VoteButton({ projectId, projectTitle, vote, onVoteSuccess }: VoteButtonProps) {
  const { isConnected, address, getKondorProvider, getKondorSigner } = useKondorWalletContext();
  const [isVoting, setIsVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();

  const handleVoteClick = () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsModalOpen(true);
  };

  const handleVote = async (votePercentage: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVoting(true);

    try {
      // Get both provider and signer from Kondor
      const provider = getKondorProvider() as ProviderInterface;
      const signer = await getKondorSigner() as SignerInterface;
      
      // Get the fund contract with both provider and signer
      const fund = getFundContract(provider, signer);

      // Show loading toast
      const loadingToast = toast.loading('Submitting your vote...');

      // Create and send the vote transaction
      const { transaction, receipt } = await fund.functions.update_vote({
        voter: address,
        project_id: projectId,
        weight: votePercentage / 5, // Use the selected vote percentage
      });
      
      console.log('Vote transaction result:', { transaction, receipt });
      
      // Wait for the transaction to be mined (if transaction exists)
      if (transaction) {
        const { blockNumber } = await provider.wait(transaction?.id!);
        console.log(`Vote transaction mined in block ${blockNumber}`);
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Vote submitted successfully!');
      
      // Show success state
      setJustVoted(true);
      setTimeout(() => setJustVoted(false), 2000);
      
      // Close the modal
      setIsModalOpen(false);
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Voting failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
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
        isLoading={isVoting}
      />
    </>
  );
} 