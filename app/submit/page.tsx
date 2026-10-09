"use client";

import Link from 'next/link';
import { SubmitProjectForm } from '@/components/submit-project-form';
import { useRouter } from 'next/navigation';

const steps = [
  {
    title: 'Describe the work',
    body: 'A clear title, what you will deliver, the monthly amount in KOIN, the wallet that gets paid, and the start and end dates.',
  },
  {
    title: 'Pay the submission fee',
    body: 'The fee depends on how long the project runs and how many proposals are already open. It is shown before you sign.',
  },
  {
    title: 'Gather votes',
    body: 'The proposal opens for voting the same day. On its start date it joins the payout list, ranked by votes.',
  },
];

export default function SubmitPage() {
  const router = useRouter();

  return (
    <div className="wrap">
      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:pt-16">
        <div>
          <h1 className="max-w-[14ch] text-[36px] font-bold leading-[1.04] tracking-[-0.035em] text-balance lg:text-[48px]">
            Propose a project to the fund.
          </h1>
          <p className="mt-5 max-w-[40ch] text-[17px] leading-normal text-ink-2">
            Proposals are public on-chain the moment they are submitted and cannot be edited afterwards, so write it the way voters should see it.
          </p>

          <ol className="mt-10 border-t border-line">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[32px_1fr] gap-4 border-b border-line py-5">
                <span className="pt-0.5 text-[15px] font-medium tabular-nums text-ink-3">{i + 1}</span>
                <div>
                  <h2 className="text-[18px] font-semibold tracking-[-0.015em]">{step.title}</h2>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm text-ink-2">
            Not sure what to put in? <Link href="/docs#submitting-projects" className="text-ink underline underline-offset-[3px]">The guide covers each field.</Link>
          </p>
        </div>

        <div className="rounded-[22px] bg-panel p-5 sm:p-8 lg:rounded-[28px]">
          <SubmitProjectForm onSuccess={() => router.push('/')} />
        </div>
      </div>
    </div>
  );
}
