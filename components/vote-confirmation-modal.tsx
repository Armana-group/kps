"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { voteExpiry } from '@/lib/payouts';
import { cn } from '@/lib/utils';

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

const quickOptions = [0, 25, 50, 75, 100];

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

  const pct = votePercentage[0];
  const nothingLeftToGive = remainingPercent === 0 && currentPercentage === 0;
  const removing = pct === 0 && currentPercentage > 0;

  // update_vote sets the expiry to the sixth upcoming payout
  const now = new Date();
  const expirationDate = voteExpiry(now);

  const handleSliderChange = (value: number[]) => {
    const rounded = Math.round(value[0] / 5) * 5;
    setVotePercentage([Math.min(rounded, remainingPercent)]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Vote</DialogTitle>
          <DialogDescription>
            {projectTitle ?? 'Project'} · #{projectId}
          </DialogDescription>
        </DialogHeader>

        <div className={cn('mt-6 rounded-2xl p-4 text-sm leading-snug', nothingLeftToGive ? 'bg-danger/10 text-danger' : 'bg-panel text-ink-2')}>
          {nothingLeftToGive ? (
            <>You&apos;ve already given 100% of your vote to other projects. Lower or remove one of them under &quot;Your votes&quot; first.</>
          ) : otherVotesPercent > 0 ? (
            <>You&apos;ve given <b className="font-semibold text-ink">{otherVotesPercent}%</b> of your vote to other projects, so this one can take up to <b className="font-semibold text-ink">{remainingPercent}%</b>.</>
          ) : (
            <>You can split <b className="font-semibold text-ink">100%</b> of your vote across projects. All of it is still free.</>
          )}
        </div>

        <div className="mt-7 text-center">
          <div className="text-[64px] font-bold leading-none tracking-[-0.04em] tabular-nums" aria-live="polite">
            {pct}<span className="text-[22px] font-semibold tracking-[-0.02em] text-ink-2">%</span>
          </div>
          <p className="mt-1.5 text-sm text-ink-2">of your voting weight</p>
        </div>

        <div className="mt-7">
          <Slider
            value={votePercentage}
            onValueChange={handleSliderChange}
            max={100}
            min={0}
            step={5}
            disabled={nothingLeftToGive}
            aria-label="Vote percentage"
          />
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {quickOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVotePercentage([option])}
              disabled={option > remainingPercent}
              aria-pressed={pct === option}
              className={cn(
                'h-9 rounded-full border text-sm font-medium transition-colors',
                pct === option ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink hover:border-ink',
                'disabled:cursor-not-allowed disabled:border-line disabled:text-ink-3 disabled:hover:border-line',
              )}
            >
              {option}%
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-2">
          {removing ? (
            <>This removes your vote from the project. You can vote again any time.</>
          ) : (
            <>Counts from today through the <b className="font-medium text-ink">{formatDate(expirationDate)}</b> payout, then expires. You can change or remove it any time.</>
          )}
        </p>

        <div className="mt-7 flex gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={removing ? 'secondary' : 'default'}
            onClick={() => onConfirm(pct)}
            disabled={isLoading || nothingLeftToGive}
            className="flex-1"
          >
            {isLoading ? <><Loader2 className="animate-spin" />Waiting for Kondor</> : removing ? 'Remove vote' : 'Confirm in Kondor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
