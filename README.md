This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Proposal payment preview

The submission page and modal preview payment eligibility as soon as valid dates are entered, without connecting a wallet. The preview reads `payment_times` from the public mainnet fund contract. Later month-end dates are marked as projections beyond the contract's six registered payment events.

Form dates are submitted at **00:00 UTC**. The start date is inclusive and the end date is exclusive. The proposal must still be active when the payout is processed. For a request of 34,000 KOIN/month starting 1 November 2026:

| End date | Eligible scheduled payments | Maximum requested total |
| --- | --- | ---: |
| 31 January 2027 | 30 November and 31 December | 68,000 KOIN |
| 1 February 2027 | 30 November, 31 December, and 31 January | 102,000 KOIN |

The UI warns when a month-end end date excludes that day's noon payment and offers the following day as an explicit correction. It does not change dates automatically. These amounts are eligibility estimates: votes, ranking, available budget, and the actual processing block determine whether payment is full, partial, or zero. Payments are not prorated by days.

The rules follow [`Fund.ts`](https://github.com/koinos/koinos-contracts-as/blob/b200169debb7c9b51de68c8a8129e39aed91398d/contracts/fund/assembly/Fund.ts): mainnet payments are scheduled at month-end noon UTC, and expired projects are removed before payment selection. If the public schedule cannot be loaded, the preview shows an error and a retry button rather than inventing dates.

Run the payment-schedule regression tests with `npm test`. They use the existing TypeScript compiler and Node's built-in test runner, with no additional test dependencies.
