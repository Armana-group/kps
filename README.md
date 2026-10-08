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

The start date is submitted at **00:00 UTC** and the end date at **13:00 UTC on the selected final day**, one hour after the usual month-end noon payment. The start timestamp is inclusive and the end timestamp is exclusive. The same UTC conversion is used for the fee, preview, and submitted transaction. The proposal must still be active when the payout is processed. For a request of 34,000 KOIN/month starting 1 November 2026:

| End date | Eligible scheduled payments | Maximum requested total |
| --- | --- | ---: |
| 30 January 2027 | 30 November and 31 December | 68,000 KOIN |
| 31 January 2027 | 30 November, 31 December, and 31 January | 102,000 KOIN |

The date picker keeps the selected date (for example, 31 January); the preview discloses its 13:00 UTC end time. A proposal from 1 to 30 November includes one scheduled payment. If a registered payment is at or after the final day's 13:00 cutoff, the UI warns and offers the following day as an explicit correction. This conversion applies to new submissions; existing on-chain proposals retain their original timestamps. These amounts are eligibility estimates: votes, ranking, available budget, and the actual processing block determine whether payment is full, partial, or zero. Payments are not prorated by days.

The rules follow [`Fund.ts`](https://github.com/koinos/koinos-contracts-as/blob/b200169debb7c9b51de68c8a8129e39aed91398d/contracts/fund/assembly/Fund.ts): mainnet payments are scheduled at month-end noon UTC, and expired projects are removed before payment selection. If the public schedule cannot be loaded, the preview shows an error and a retry button rather than inventing dates.

For ranges longer than six payment dates, the preview shows the first two and last two dates, with the full count and requested total. Users can expand all dates in a scrollable table; changing the date range restores the compact view.

Run the payment-schedule regression tests with `npm test`. They use the existing TypeScript compiler and Node's built-in test runner, with no additional test dependencies.

## Hidden proposals and author notices

Edit `config/hidden-proposals.json` to maintain author-requested invalid proposals. Each entry has a numeric `id` and a public `reason`, for example:

```json
[
  { "id": 8, "reason": "This proposal was created incorrectly." },
  { "id": 9, "reason": "This proposal was created incorrectly." }
]
```

Listed proposals are hidden from both active and upcoming cards on the home page. Their direct `/projects/<id>` pages remain accessible and display a red author notice asking voters to remove their votes (set the vote to 0%). Unlisted proposals have no notice. Remove an entry to restore the home-page card and clear the notice; an empty array disables all notices. Configuration changes require rebuilding and deploying the frontend.

These are frontend notices recorded at the author's request, not an on-chain invalid status or an automatic vote removal. Hidden proposals still participate in the fund's payment allocation, so the home page calculates payment estimates before hiding their cards. Only add an author notice after confirming the author's request. Proposals 8 and 9 are included at their author's request.
