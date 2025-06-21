"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKondorWallet } from '@/hooks/useKondorWallet';
import { getFundContract } from '@/lib/utils';
import { ThumbsUp, Loader2 } from 'lucide-react';

interface VoteButtonProps {
  projectId: number;
  onVoteSuccess?: () => void;
}

export function VoteButton({ projectId, onVoteSuccess }: VoteButtonProps) {
  const { isConnected, address, getKondorProvider, signAndSendTransaction } = useKondorWallet();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      // Get the provider with Kondor
      const provider = getKondorProvider();
      
      // Get the fund contract with the Kondor provider
      const fund = getFundContract(
        provider,
        "18h1MU6z4LkD7Lk2BohhejA9j61TDUwvRB" // Contract address
      );

      // Prepare the vote transaction
      const transaction = await fund.functions.update_vote({
        voter: address,
        project_id: projectId,
        weight: 100, // Default vote weight, you can make this configurable
      });

      // Sign and send the transaction using Kondor
      const result = await signAndSendTransaction(transaction);
      
      console.log('Vote transaction result:', result);
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Voting failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  if (!isConnected) {
    return (
      <Button variant="outline" disabled>
        <ThumbsUp className="w-4 h-4 mr-2" />
        Connect Wallet to Vote
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleVote}
        disabled={isVoting}
        className="flex items-center gap-2"
      >
        {isVoting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsUp className="w-4 h-4" />
        )}
        {isVoting ? 'Voting...' : 'Vote'}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 