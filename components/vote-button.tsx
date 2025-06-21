"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { getFundContract } from '@/lib/utils';
import { ThumbsUp, Loader2, CheckCircle } from 'lucide-react';
import { ProviderInterface, SignerInterface } from 'koilib';
import toast from 'react-hot-toast';

interface VoteButtonProps {
  projectId: number;
  onVoteSuccess?: () => void;
}

export function VoteButton({ projectId, onVoteSuccess }: VoteButtonProps) {
  const { isConnected, address, getKondorProvider, getKondorSigner } = useKondorWalletContext();
  const [isVoting, setIsVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  const handleVote = async () => {
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
      const fund = getFundContract(provider, "18h1MU6z4LkD7Lk2BohhejA9j61TDUwvRB", signer);

      // Show loading toast
      const loadingToast = toast.loading('Submitting your vote...');

      // Create and send the vote transaction
      const { transaction, receipt } = await fund.functions.update_vote({
        voter: address,
        project_id: projectId,
        weight: 100, // Default vote weight, you can make this configurable
      });
      
      console.log('Vote transaction result:', { transaction, receipt });
      
      // Wait for the transaction to be mined (if transaction exists)
      if (transaction) {
        const { blockNumber } = await transaction.wait();
        console.log(`Vote transaction mined in block ${blockNumber}`);
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Vote submitted successfully!');
      
      // Show success state
      setJustVoted(true);
      setTimeout(() => setJustVoted(false), 2000);
      
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

  if (!isConnected) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className="w-full h-11 rounded-xl font-medium text-sm border-border hover:border-border"
      >
        <ThumbsUp className="w-4 h-4 mr-2" />
        Connect Wallet to Vote
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleVote}
      disabled={isVoting || justVoted}
      className={`w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 ${
        justVoted 
          ? 'bg-green-500 hover:bg-green-500 text-white' 
          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md'
      }`}
    >
      {isVoting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Voting...
        </>
      ) : justVoted ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Vote Submitted!
        </>
      ) : (
        <>
          <ThumbsUp className="w-4 h-4 mr-2" />
          Vote for Project
        </>
      )}
    </Button>
  );
} 