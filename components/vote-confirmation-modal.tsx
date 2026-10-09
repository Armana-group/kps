"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThumbsUp, Loader2, Trash2 } from 'lucide-react';

interface VoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (votePercentage: number) => Promise<void>;
  projectId: number;
  projectTitle?: string;
  /** The wallet's current active vote on this project, in percent. */
  currentPercentage?: number;
  /** Percent already given to other projects. */
  otherVotesPercent?: number;
  /** The most this project can receive without going over 100%. */
  remainingPercent?: number;
  isLoading?: boolean;
}

export function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  projectId,
  projectTitle,
  currentPercentage = 0,
  otherVotesPercent = 0,
  remainingPercent = 100,
  isLoading = false,
}: VoteConfirmationModalProps) {
  // Start from the existing vote, otherwise 50% or whatever is left if less
  const defaultPercentage = currentPercentage > 0 ? currentPercentage : Math.min(50, remainingPercent);
  const [votePercentage, setVotePercentage] = useState<number[]>([defaultPercentage]);

  useEffect(() => {
    if (isOpen) setVotePercentage([defaultPercentage]);
  }, [isOpen, defaultPercentage]);

  const nothingLeftToGive = remainingPercent === 0 && currentPercentage === 0;

  // Calculate expiration date (6 months from now, last day of the month)
  const calculateExpirationDate = () => {
    const now = new Date();
    const expirationDate = new Date(now.getFullYear(), now.getMonth() + 6, 0); // Last day of 6th month from now
    return expirationDate;
  };

  const expirationDate = calculateExpirationDate();

  const handleConfirm = async () => {
    await onConfirm(votePercentage[0]);
  };

  const handleSliderChange = (value: number[]) => {
    // Ensure the value is in multiples of 5 and stays within what's left to give
    const roundedValue = Math.round(value[0] / 5) * 5;
    setVotePercentage([Math.min(roundedValue, remainingPercent)]);
  };

  const percentageOptions = [0, 25, 50, 75, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Confirm Your Vote
          </DialogTitle>
          <DialogDescription>
            {projectTitle ? (
              <>
                Choose your vote percentage for <strong>{projectTitle}</strong> (Project #{projectId}). 
                Your vote will be submitted to the blockchain.
              </>
            ) : (
              <>
                Choose your vote percentage for Project #{projectId}. 
                Your vote will be submitted to the blockchain.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* How much of the wallet's vote is already used elsewhere */}
          <div className={`rounded-lg p-3 text-sm ${nothingLeftToGive
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            : 'bg-muted/50 text-muted-foreground'}`}>
            {nothingLeftToGive ? (
              <>You&apos;ve already given 100% of your vote to other projects. Lower or remove one of them under &quot;Your votes&quot; first.</>
            ) : otherVotesPercent > 0 ? (
              <>You&apos;ve given {otherVotesPercent}% of your vote to other projects, so you can give this one up to <strong>{remainingPercent}%</strong>.</>
            ) : (
              <>You can split 100% of your vote across projects. This vote can be up to <strong>{remainingPercent}%</strong>.</>
            )}
          </div>

          {/* Vote Percentage Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {votePercentage[0]}%
            </div>
            <div className="text-sm text-muted-foreground">
              Vote Weight
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <Slider
              value={votePercentage}
              onValueChange={handleSliderChange}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            
            {/* Quick Selection Buttons */}
            <div className="flex justify-between gap-2">
              {percentageOptions.map((option) => (
                <Button
                  key={option}
                  variant={votePercentage[0] === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVotePercentage([option])}
                  disabled={option > remainingPercent}
                  className="flex-1 text-xs"
                >
                  {option}%
                </Button>
              ))}
            </div>
          </div>

          {/* Vote Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            {projectTitle && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-medium text-right max-w-48 truncate" title={projectTitle}>
                  {projectTitle}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project ID:</span>
              <span className="font-medium">#{projectId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vote Weight:</span>
              <span className="font-medium">{votePercentage[0]}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium">{expirationDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || nothingLeftToGive}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : votePercentage[0] === 0 ? (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Vote
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 mr-2" />
                Confirm Vote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 