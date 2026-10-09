"use client";

import { useCallback } from 'react';
import { ProviderInterface, SignerInterface } from 'koilib';
import toast from 'react-hot-toast';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { getFundContract, ProcessedVote } from '@/lib/utils';
import { explainVoteError } from '@/lib/vote-budget';

/**
 * Sends update_vote for the connected wallet. A percentage of 0 removes the vote.
 * `votes` and `titles` are only used to explain an over-100% error. Resolves to
 * true once the transaction is mined.
 */
export function useSubmitVote() {
  const { isConnected, address, getKondorProvider, getKondorSigner } = useKondorWalletContext();

  return useCallback(async (
    projectId: number,
    votePercentage: number,
    votes: ProcessedVote[] = [],
    titles: Record<number, string> = {},
  ): Promise<boolean> => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    const submitVote = async () => {
      // Get both provider and signer from Kondor
      const provider = getKondorProvider() as ProviderInterface;
      const signer = await getKondorSigner() as SignerInterface;

      // Get the fund contract with both provider and signer
      const fund = getFundContract(provider, signer);

      // Create and send the vote transaction
      const { transaction, receipt } = await fund.functions.update_vote({
        voter: address,
        project_id: projectId,
        weight: votePercentage / 5, // the contract stores weight in 5% units
      });

      console.log('Vote transaction result:', { transaction, receipt });

      // Wait for the transaction to be mined (if transaction exists)
      if (transaction?.id) {
        const { blockNumber } = await provider.wait(transaction.id);
        console.log(`Vote transaction mined in block ${blockNumber}`);
      }

      return { transaction, votePercentage };
    };

    try {
      await toast.promise(
        submitVote(),
        {
          loading: votePercentage === 0 ? 'Removing your vote...' : 'Submitting your vote...',
          success: (data) => data.votePercentage === 0
            ? 'Vote removed.'
            : `Vote of ${data.votePercentage}% submitted successfully!`,
          error: (error) => explainVoteError(error, votes, new Date(), projectId, titles)
            ?? 'Failed to submit vote. Please try again.',
        },
        {
          style: {
            minWidth: '250px',
          },
          success: {
            duration: 4000,
            icon: '🗳️',
          },
          error: {
            duration: 10000,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      // Error is already handled by toast.promise
      return false;
    }
  }, [isConnected, address, getKondorProvider, getKondorSigner]);
}
