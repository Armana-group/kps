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
3. **Funding distribution.** Projects with enough community support receive monthly payments automatically.

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
3. **Connect to KFS.** Click "Connect Wallet" in the top right corner of the KFS site.

## Browsing Projects

The main page shows projects in two groups.

**Active projects** are running now and receive funding based on community votes. They are paid monthly, open for voting, and sorted by total votes.

**Upcoming projects** will become active on their start date and are gathering support. They are not paid yet but are already open for voting.

Each project card shows its title, description, monthly payment, start and end dates, total votes, beneficiary address, and payment status.

## Voting System

### Vote weight

Each KOIN and each VHP in your wallet counts as one vote. You can give all of it to one project or split it across several, in steps of 5%.

### Your votes add up to 100%

All your votes together can't go over 100%. If you gave 50% to one project, you have 50% left for the others. This includes expired votes and votes on finished projects: they keep their share until you remove them. Lowering or removing a vote frees that share up again.

### Seeing and removing your votes

Connect your wallet and click "Your votes" at the top right of the main page. It lists every vote you hold, how much of your 100% is used, and when each vote expires. Press the bin icon next to a vote to take it back. This sets it to 0%.

### Vote duration

Votes expire after about 6 months. An expired vote no longer counts toward its project, but it still uses its share of your 100% until you remove it. You can renew it, change its percentage, or remove it at any time.

### Tokens are not locked

Your KOIN and VHP stay in your wallet and you can transfer them at any time. When you do, your votes update automatically to match your new balance.

### Impact on funding

Projects with more votes are paid first. If the fund can't cover every project, the highest-voted projects are paid in full and lower-voted ones may get a partial payment or nothing.

### How to vote

1. Connect your Kondor wallet
2. Click "Vote for Project" on any project
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

1. Click "Submit Project"
2. Fill out all required fields
3. Review the calculated submission fee
4. Submit the form and confirm the transaction
5. Wait for the transaction to be confirmed

## Funding Mechanism

### Where the money comes from

Payments come out of the KOIN held by the fund contract, shown as the fund balance on the main page. A regular, automatic source of new KOIN for the fund is planned but isn't live yet.

### Payment priority

Projects are ranked by total votes. Higher-voted projects are paid first each month.

### Payment status

- **Full payment:** the project receives its full monthly amount
- **Partial payment:** the project receives part of it because funds ran short
- **No payment:** the project receives nothing this month

### Payment schedule

Payments are made monthly, at the next payment time shown on the main page.

## Fees & Costs

- **Submitting a project** costs a fee based on the project's duration, the number of existing projects, and a fee setting in the contract. It is shown before you submit. Make sure you have enough KOIN for the fee and the transaction cost.
- **Voting is free.** You only need to hold KOIN or VHP.

## FAQ

### Why does it say my votes exceeded 100%?

You already have votes on other projects, possibly from months ago, and the new vote would take your total over 100%. Expired votes and votes on finished projects count too, until you remove them. Click "Your votes" at the top right of the main page, then lower or remove one of them, or vote with a smaller percentage.

### How do I see or remove my votes?

Connect your wallet and click "Your votes" at the top right of the main page. Each vote has a bin icon that removes it.

### How do I get KOIN?

Buy it on an exchange or earn it through mining. See [koinos.io](https://koinos.io) for more.

### Can I change my vote?

Yes, at any time. A new vote on a project replaces your previous vote on that project.

### What happens if my vote expires?

It stops counting toward the project's total, but it still uses its share of your 100%. Vote for the project again to renew it, or remove it to free that share.

### Why was my project rejected?

Projects are never rejected by the system. They go on-chain and become open for voting. A project with little community support may simply receive no funding.

### How are payments distributed?

Monthly, by vote ranking. Higher-voted projects are paid first, to the beneficiary address in the project.

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
- `get_global_vars()` returns project counts and upcoming `payment_times`.

The contract keeps a running total of each wallet's vote weights that only drops when a vote is set to 0, so expired votes and votes on finished projects still count toward the limit. If `update_vote` would push that total past 100%, the contract rejects it with an error like "votes have exceeded 100% by 50%". The fix is to lower another vote first.
