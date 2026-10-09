// The three soft panels below the project lists. Static copy, no data.
const items = [
  {
    title: 'Vote without spending',
    body: 'Your voting weight is your KOIN and VHP balance. Split 100% of it across projects in 5% steps, change it any time, and keep every token.',
    art: (
      <svg viewBox="0 0 96 96" className="size-[92px] fill-none stroke-ink" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="14" y="30" width="68" height="44" rx="8" />
        <path d="M14 44h68" />
        <circle cx="66" cy="59" r="5" className="fill-accent stroke-none" />
        <path d="M24 20h48" className="stroke-accent" />
        <path d="M30 12h36" opacity=".35" />
      </svg>
    ),
  },
  {
    title: 'Paid monthly, in vote order',
    body: 'On the last day of each month the fund pays the highest-voted project first, then the next, until that payout’s budget runs out: twice the KOIN that came in since the last payout. A vote counts in the next six payouts.',
    art: (
      <svg viewBox="0 0 96 96" className="size-[92px] fill-none stroke-ink" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 72V40M38 72V24M56 72V48M74 72V34" />
        <path d="M14 72h68" className="stroke-accent" />
        <circle cx="38" cy="24" r="4" className="fill-accent stroke-none" />
        <circle cx="74" cy="34" r="4" />
        <circle cx="20" cy="40" r="4" />
        <circle cx="56" cy="48" r="4" />
      </svg>
    ),
  },
  {
    title: 'Propose your own',
    body: 'Describe the work, the monthly amount and the dates. The proposal goes on-chain and opens for voting the same day.',
    art: (
      <svg viewBox="0 0 96 96" className="size-[92px] fill-none stroke-ink" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="22" y="14" width="52" height="68" rx="8" />
        <path d="M34 32h28M34 44h28M34 56h16" />
        <circle cx="64" cy="66" r="7" className="fill-accent stroke-none" />
        <path d="M61 66l2 2 4-4" className="stroke-accent-ink" strokeWidth={1.8} />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="wrap pt-20 lg:pt-28" aria-labelledby="how-heading">
      <h2 id="how-heading" className="max-w-[24ch] text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] lg:text-[36px]">
        Your KOIN is your vote. It never leaves your wallet.
      </h2>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col rounded-[22px] bg-panel p-7 pb-8 lg:min-h-[300px] lg:rounded-[28px]">
            <div className="mb-6 grid h-[120px] place-items-center">{item.art}</div>
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{item.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
