# Koinos Fund System

> A guide to the Koinos Fund System (KFS): the on-chain fund where KOIN and VHP holders vote on which community projects get paid each month.

## Overview

### What is the Koinos Fund System?

The Koinos Fund System (KFS) is a decentralized funding platform built for the Koinos blockchain ecosystem. Community members propose projects, vote on them, and the fund pays the best-supported ones each month.

### Why does it exist?

Blockchain funding often suffers from centralization, lack of transparency, and limited community input. KFS addresses this with:

- **Democratic governance.** Every KOIN holder has a voice in which projects receive funding, proportional to their stake.
- **A transparent process.** All proposals, votes, and payments are recorded on-chain.
- **Sustainable funding.** A continuous mechanism that supports long-term ecosystem development.
- **Innovation.** Accessible funding for developers and creators.

### How does it work?

KFS runs on community-driven funding through token-weighted voting:

1. **Project submission.** Community members submit proposals with clear objectives, timelines, and funding requirements.
2. **Community review.** KOIN and VHP holders review proposals and vote, using their tokens as voting weight.
3. **Funding distribution.** At each monthly payout the fund pays projects in vote order, automatically, until that payout's budget runs out.

### Who benefits?

- **Developers** get funding to build tools, dApps, and infrastructure for Koinos.
- **The community** takes part in governance and shapes the Koinos ecosystem.
- **The ecosystem** benefits from continuous development funding.

## Getting Started

### What you can do

- Vote on projects using your KOIN or VHP, without spending them
- Submit your own projects for community funding
- Track funding distribution and payments

### What you need

- The Kondor wallet browser extension
- KOIN or VHP in that wallet, for voting
- A basic understanding of the Koinos ecosystem

## Wallet Setup

1. **Install the extension.** Install [Kondor from the Chrome Web Store](https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl).
2. **Create or import a wallet.** Follow the setup wizard to create a new wallet or import an existing one with your seed phrase.
3. **Connect to KFS.** Click "Connect wallet" in the top right corner of the KFS site.

## Browsing Projects

The main page shows projects in two groups.

**Being paid now** lists projects that have started and are still running at the next payout, sorted by votes. Each row shows what the project is expected to receive at that payout.

**Starting soon** lists projects whose start date hasn't come yet. They are already open for voting. A project joins the payouts at the first payout after its start date and leaves once its end date has passed.

Each project shows its title, description, total votes, monthly ask, and either its expected payout or its start date.

## Voting System

### Vote weight

Your voting weight is the KOIN plus the VHP in your wallet. You can give all of it to one project or split it across several, in steps of 5%. Tokens you have deposited in a Fogata mining pool are held by the pool, not your wallet, so they do not count.

### Your votes add up to 100%

All your votes together can't go over 100%. If you gave 50% to one project, you have 50% left for the others. This includes expired votes and votes on finished projects: they keep their share until you remove them. Lowering or removing a vote frees that share up again.

### Seeing and removing your votes

Connect your wallet and click "Your votes" at the top right of the main page. It lists every vote you hold, how much of your 100% is used, and when each vote expires. Press the × next to a vote to take it back. This sets it to 0%.

### Vote duration

A vote counts in the next six monthly payouts, then expires, so it lasts five to six months. An expired vote no longer counts toward its project, but it still uses its share of your 100% until you remove it. Voting for the project again renews it for another six payouts. You can change or remove a vote at any time.

### Tokens are not locked

Your KOIN and VHP stay in your wallet and you can transfer them at any time. When you do, your votes update automatically to match your new balance. If both your KOIN and VHP balances drop to zero, all your votes are removed.

### Impact on funding

Projects with more votes are paid first. Each payout has a limited budget, so the highest-voted projects are paid in full and lower-voted ones may get a partial payment or nothing.

### How to vote

1. Connect your Kondor wallet
2. Click "Vote" on any project
3. Choose a percentage (5%, 10%, 15%, and so on)
4. Confirm the transaction in your wallet
5. Wait for the transaction to be confirmed

## Submitting Projects

### Required information

- **Project title:** a clear, descriptive name
- **Description:** a detailed explanation of the project
- **Monthly payment:** the amount of KOIN requested per month
- **Beneficiary address:** a valid Koinos address to receive the funds
- **Start date:** when funding should begin
- **End date:** when funding should end

### Submission fee

The fee depends on the project's duration and the current number of projects. It is calculated and shown before you submit.

### After you submit

Your project shows as "Upcoming" until its start date, then becomes "Active" and eligible for funding. Projects are not reviewed or rejected by anyone: they go on-chain and the community decides with its votes.

### How to submit

1. Click "Submit a project"
2. Fill out all required fields
3. Review the calculated submission fee
4. Submit the form and confirm the transaction
5. Wait for the transaction to be confirmed

## Funding Mechanism

### Where the money comes from

The Koinos protocol mints new KOIN for the fund with every block, at a rate of 2% of the KOIN supply per year (a few thousand KOIN a day). KOIN that isn't paid out stays in the fund.

### How much each payout can spend

A payout can spend at most twice the KOIN that came into the fund since the previous payout, and never more than the fund holds. So a single payout can't spend the whole balance; the rest carries over.

The main page shows an estimate for the next payout: the KOIN received so far, projected to the payout date at the current rate, times two. The real figure depends on how much actually arrives before the payout.

### Payment priority

The contract walks through the projects in the payout from most to fewest votes. Each one takes its monthly ask out of the budget, or whatever is left of it, until the budget runs out.

### Payment status

- **Full payment:** the project receives its full monthly ask
- **Partial payment:** the project receives what was left of the budget
- **Stays in the fund:** the project's beneficiary is the fund itself, so its share is set aside but never leaves the fund
- **No payment:** the budget ran out first, or the project has no votes. A project with no votes still uses up its share of the budget, but receives nothing

### Payment schedule

Payouts run at noon UTC on the last day of each month. The next one is shown on the main page.

## Fees & Costs

- **Submitting a project** costs a fee based on the project's duration, the number of existing projects, and a fee setting in the contract. It is shown before you submit. Make sure you have enough KOIN for the fee and the transaction cost.
- **Voting costs no KOIN.** You only need to hold KOIN or VHP. Like any Koinos transaction, a vote uses some of your mana.

## FAQ

### Why does it say my votes exceeded 100%?

You already have votes on other projects, possibly from months ago, and the new vote would take your total over 100%. Expired votes and votes on finished projects count too, until you remove them. Click "Your votes" at the top right of the main page, then lower or remove one of them, or vote with a smaller percentage.

### How do I see or remove my votes?

Connect your wallet and click "Your votes" at the top right of the main page. Each vote has a bin icon that removes it.

### How do I get KOIN?

Buy it on an exchange or earn it through mining. See [koinos.io](https://koinos.io) for more.

### Can I vote with tokens I have in Fogata?

Not yet. Your vote weight is the KOIN and VHP held directly in your wallet. Tokens deposited in a Fogata mining pool are held by the pool contract, so they do not count toward your vote. To vote with them, withdraw them to your wallet first. Voting from pools is planned for Fogata v2.

### Can I change my vote?

Yes, at any time. A new vote on a project replaces your previous vote on that project.

### What happens if my vote expires?

It stops counting toward the project's total, but it still uses its share of your 100%. Vote for the project again to renew it, or remove it to free that share.

### Why was my project rejected?

Nobody reviews or rejects projects. The contract only checks the basics: a title of up to 100 characters, a description of up to 1,000, an end date after the start date and in the future, and the fee. A project that passes goes on-chain and opens for voting. One with little support may simply receive no funding.

### How are payments distributed?

At noon UTC on the last day of each month, by vote ranking, to the beneficiary address in each project, until that payout's budget runs out. See Funding Mechanism above.

### Can I vote on a project that has ended?

No. You can only remove an existing vote on it, which frees up its share of your 100%.

### Can I submit more than one project?

Yes. Each project pays its own submission fee and is voted on separately.

## For Developers and AI Tools

This guide is also available as plain text at [/llms-full.txt](/llms-full.txt), with a short index at [/llms.txt](/llms.txt).

KFS is a smart contract on Koinos mainnet. You can read it through any Koinos RPC node, such as `https://api.koinos.io`.

| Item | Value |
|---|---|
| Fund contract | `1A5BmMqV5jN5zBrdkhQumAfDZBzXLPBeN9` |
| KOIN token contract | `19GYjDBVXU7keLbYvMLazsGQn3GTWHjHkK` |

Main contract methods:

- `get_user_votes({ voter })` lists a wallet's votes. Each has `project_id`, `weight` and `expiration` (milliseconds since 1970).
- `update_vote({ voter, project_id, weight })` sets one vote and replaces any earlier vote on that project. `weight` is in 5% steps: 1 means 5%, 20 means 100%, and 0 removes the vote.
- `get_project({ project_id })` and `get_projects({ status, order_by, start, limit, descending })` read proposals. Status 0 is upcoming, 1 is active, 2 is past.
- `get_global_vars()` returns project counts, the next six `payment_times`, and `remaining_balance` (what was left in the fund after the last payout).

Each payout's budget is `min(balance, 2 × (balance − remaining_balance))`. Projects in the payout are those that have started and not yet ended at the payout time, paid from most to fewest votes. A payment is sent only if the project has votes and its beneficiary isn't the fund itself, but every project's ask counts against the budget.

A vote's `expiration` is the sixth upcoming payout when it was cast, and it still counts in that payout.

The submission fee is `p³ × (duration ÷ fee_denominator)` in KOIN satoshis, where `p` is the number of active and upcoming projects plus one.

The contract keeps a running total of each wallet's vote weights that only drops when a vote is set to 0, so expired votes and votes on finished projects still count toward the limit. If `update_vote` would push that total past 100%, the contract rejects it with an error like "votes have exceeded 100% by 50%". The fix is to lower another vote first.
