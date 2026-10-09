import { AlertTriangle } from 'lucide-react';
import { getProposalNoticeText, ProposalNoticeConfig } from '@/lib/proposal-visibility';

export function ProposalNotice({ notice, variant = 'detail' }: {
  notice: ProposalNoticeConfig['notice'];
  variant?: 'compact' | 'detail';
}) {
  const text = getProposalNoticeText(notice, variant);

  if (variant === 'compact') {
    return (
      <p role="note" aria-label={notice.title} title={`${notice.title}: ${text}`} className="mt-2.5 flex items-start gap-2 text-[13px] font-medium leading-snug text-danger">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        <span className="line-clamp-2">{text}</span>
      </p>
    );
  }

  return (
    <div role="alert" className="mb-8 flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/5 p-4 text-danger">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} />
      <div className="min-w-0 space-y-1">
        <h2 className="font-semibold">{notice.title}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  );
}
