import { AlertTriangle } from 'lucide-react';
import { getProposalNoticeText, ProposalNoticeConfig } from '@/lib/proposal-visibility';

export function ProposalNotice({ notice, variant = 'detail' }: {
  notice: ProposalNoticeConfig['notice'];
  variant?: 'compact' | 'detail';
}) {
  const text = getProposalNoticeText(notice, variant);

  if (variant === 'compact') {
    return (
      <div role="note" aria-label={notice.title} title={`${notice.title}: ${text}`} className="mb-6 h-[4.25rem] overflow-hidden rounded-lg border border-red-500/70 bg-red-50 px-3 py-2 text-red-900 dark:bg-red-950/60 dark:text-red-200">
        <p className="text-xs leading-4 line-clamp-3 break-words">
          <strong>{notice.title}</strong> — {text}
        </p>
      </div>
    );
  }

  return (
    <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/50 bg-red-50 p-4 text-red-900 dark:bg-red-950/40 dark:text-red-200">
      <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 space-y-2">
        <h2 className="font-semibold break-words">{notice.title}</h2>
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  );
}
