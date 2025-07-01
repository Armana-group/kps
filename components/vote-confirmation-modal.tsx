"use client";

import { useState } from 'react';
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
  isLoading?: boolean;
}

export function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  projectId,
  projectTitle,
  isLoading = false,
}: VoteConfirmationModalProps) {
  const [votePercentage, setVotePercentage] = useState<number[]>([50]); // Default to 50%

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
    // Ensure the value is in multiples of 5
    const roundedValue = Math.round(value[0] / 5) * 5;
    setVotePercentage([roundedValue]);
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
            disabled={isLoading}
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