"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Vote, Wallet, FileText, DollarSign, Users, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();

  const tableOfContents = [
    { id: "overview", title: "Project Overview", number: 1 },
    { id: "getting-started", title: "Getting Started", number: 2 },
    { id: "wallet-setup", title: "Wallet Setup", number: 3 },
    { id: "browsing-projects", title: "Browsing Projects", number: 4 },
    { id: "voting-system", title: "Voting System", number: 5 },
    { id: "submitting-projects", title: "Submitting Projects", number: 6 },
    { id: "funding-mechanism", title: "Funding Mechanism", number: 7 },
    { id: "fees-costs", title: "Fees & Costs", number: 8 },
    { id: "faq", title: "FAQ", number: 9 }
  ];

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <div className="flex">
        {/* Sidebar Table of Contents */}
        <div className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border/50 bg-card/30 backdrop-blur-sm z-10">
          <div className="p-6 sticky top-0">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Contents</h2>
            </div>

            <nav className="space-y-2">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-6 h-6 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                    {item.number}
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground">
                    {item.title}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="max-w-4xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <section className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 tracking-tight">
                Koinos Fund System
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                A comprehensive guide to using the Koinos Fund System (KFS) - the decentralized funding platform
                that empowers the Koinos blockchain community through democratic project funding.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push('/')} className="h-10 px-5 py-2 rounded-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Platform
                </Button>
                <Button variant="outline" className="h-10 px-5 py-2 rounded-lg" onClick={() => window.open('https://koinos.io', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn About Koinos
                </Button>
              </div>
            </section>

            {/* Project Overview */}
            <section id="overview" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">1</div>
                <h2 className="text-3xl font-bold">Project Overview</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-primary" />
                      What is the Koinos Fund System?
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      The Koinos Fund System (KFS) is a decentralized autonomous funding platform built specifically for the Koinos blockchain ecosystem.
                      It serves as a democratic mechanism where community members can propose, vote on, and fund projects that advance the Koinos blockchain and its ecosystem.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      Why does it exist?
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      Traditional blockchain funding mechanisms often suffer from centralization, lack of transparency, and limited community input.
                      The KFS was created to address these fundamental issues by providing:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold">Democratic Governance</h4>
                            <p className="text-sm text-muted-foreground">Every KOIN holder has a voice in which projects receive funding, proportional to their stake.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold">Transparent Process</h4>
                            <p className="text-sm text-muted-foreground">All proposals, votes, and funding decisions are recorded on-chain for complete transparency.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold">Sustainable Funding</h4>
                            <p className="text-sm text-muted-foreground">Continuous funding mechanism that supports long-term ecosystem development.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold">Innovation Driver</h4>
                            <p className="text-sm text-muted-foreground">Encourages innovation by providing accessible funding for developers and creators.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                      <Vote className="w-6 h-6 text-primary" />
                      How does it work?
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      The KFS operates on a simple yet powerful principle: community-driven funding through token-weighted voting.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">1</div>
                          <div>
                            <h4 className="font-semibold">Project Submission</h4>
                            <p className="text-sm text-muted-foreground">Community members submit project proposals with clear objectives, timelines, and funding requirements.</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">2</div>
                          <div>
                            <h4 className="font-semibold">Community Review</h4>
                            <p className="text-sm text-muted-foreground">KOIN holders review proposals and vote using their tokens as voting weight.</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">3</div>
                          <div>
                            <h4 className="font-semibold">Funding Distribution</h4>
                            <p className="text-sm text-muted-foreground">Projects with sufficient community support receive monthly funding payments automatically.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      Who benefits?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Developers</h4>
                        <p className="text-sm text-muted-foreground">Get funding to build tools, dApps, and infrastructure for Koinos.</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Community</h4>
                        <p className="text-sm text-muted-foreground">Participate in governance and shape the future of the Koinos ecosystem.</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Ecosystem</h4>
                        <p className="text-sm text-muted-foreground">Benefits from continuous innovation and development funding.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">2</div>
                <h2 className="text-3xl font-bold">Getting Started</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <p className="text-lg text-muted-foreground mb-6">
                  The Koinos Fund System (KFS) is a decentralized platform where the Koinos community can propose,
                  vote on, and fund projects that benefit the Koinos blockchain ecosystem.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">What You Can Do</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Vote className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Vote on projects using your KOIN tokens</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Submit your own projects for community funding</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Track funding distribution and payments</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">What You Need</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Kondor wallet extension installed</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>KOIN tokens for voting and fees</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Understanding of the Koinos ecosystem</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Wallet Setup */}
            <section id="wallet-setup" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">2</div>
                <h2 className="text-3xl font-bold">Wallet Setup</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Installing Kondor Wallet</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Step 1: Install the Extension</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download and install the Kondor wallet extension from the Chrome Web Store.
                      </p>
                      <Button
                        variant="outline"
                        className="h-9 px-4 py-2 rounded-md"
                        onClick={() => window.open('https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Install Kondor
                      </Button>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Step 2: Create or Import Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        Follow the setup wizard to create a new wallet or import an existing one using your seed phrase.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Step 3: Connect to KFS</p>
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Connect Wallet&quot; in the top right corner of the KFS platform to connect your Kondor wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Browsing Projects */}
            <section id="browsing-projects" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">3</div>
                <h2 className="text-3xl font-bold">Browsing Projects</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <p className="text-lg text-muted-foreground">
                    The KFS platform displays projects in two main categories:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold">Active Projects</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Currently running projects that are actively receiving funding based on community votes.
                      </p>
                      <div className="text-sm space-y-2">
                        <p>• Receiving monthly payments</p>
                        <p>• Open for voting</p>
                        <p>• Sorted by total votes</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold">Upcoming Projects</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Projects that will become active in the future and are currently gathering community support.
                      </p>
                      <div className="text-sm space-y-2">
                        <p>• Not yet receiving payments</p>
                        <p>• Open for voting</p>
                        <p>• Will become active on start date</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Project Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Each project card shows: title, description, monthly payment amount, start/end dates,
                      total votes received, beneficiary address, and current payment status.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Voting System */}
            <section id="voting-system" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">4</div>
                <h2 className="text-3xl font-bold">Voting System</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Vote className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">How Voting Works</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Vote Weight</p>
                      <p className="text-sm text-muted-foreground">
                        Your vote weight is determined by your KOIN token balance. You can vote with 5%, 10%, 15%, or 20% of your tokens.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Vote Duration</p>
                      <p className="text-sm text-muted-foreground">
                        Votes are time-limited and will expire. You can renew expired votes or change your vote percentage at any time.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Impact on Funding</p>
                      <p className="text-sm text-muted-foreground">
                        Projects with higher total votes receive priority in funding distribution. If the fund balance is insufficient,
                        higher-voted projects receive full payments while lower-voted ones may receive partial or no payments.
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium text-primary mb-2">Voting Steps</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Connect your Kondor wallet</li>
                                              <li>Click &quot;Vote for Project&quot; on any project</li>
                      <li>Choose your vote percentage (5%, 10%, 15%, or 20%)</li>
                      <li>Confirm the transaction in your wallet</li>
                      <li>Wait for transaction confirmation</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Submitting Projects */}
            <section id="submitting-projects" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">5</div>
                <h2 className="text-3xl font-bold">Submitting Projects</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Project Submission Process</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Required Information</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Project Title:</strong> Clear, descriptive name</li>
                        <li>• <strong>Description:</strong> Detailed explanation of the project</li>
                        <li>• <strong>Monthly Payment:</strong> Amount in KOIN requested per month</li>
                        <li>• <strong>Beneficiary Address:</strong> Valid Koinos address to receive funds</li>
                        <li>• <strong>Start Date:</strong> When funding should begin</li>
                        <li>• <strong>End Date:</strong> When funding should end</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Submission Fee</p>
                      <p className="text-sm text-muted-foreground">
                        A submission fee is calculated based on the project duration and current number of projects.
                        The fee is automatically calculated and displayed before submission.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Review Process</p>
                      <p className="text-sm text-muted-foreground">
                        Once submitted, your project will appear as &quot;Upcoming&quot; until the start date,
                        when it becomes &quot;Active&quot; and eligible for funding.
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium text-primary mb-2">Submission Steps</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                                              <li>Click &quot;Submit Project&quot; button</li>
                      <li>Fill out all required fields</li>
                      <li>Review the calculated submission fee</li>
                      <li>Submit the form and confirm the transaction</li>
                      <li>Wait for blockchain confirmation</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Funding Mechanism */}
            <section id="funding-mechanism" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">6</div>
                <h2 className="text-3xl font-bold">Funding Mechanism</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">How Funding Works</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Fund Balance</p>
                      <p className="text-sm text-muted-foreground">
                        The platform maintains a fund balance that is distributed monthly to active projects.
                        You can view the current fund balance on the main page.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Payment Priority</p>
                      <p className="text-sm text-muted-foreground">
                        Projects are ranked by total votes received. Higher-voted projects receive priority
                        in funding distribution each month.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Payment Status</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• <strong>Full Payment:</strong> Project receives full monthly amount</p>
                        <p>• <strong>Partial Payment:</strong> Project receives partial amount due to limited funds</p>
                        <p>• <strong>No Payment:</strong> Project receives no funding this month</p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Payment Schedule</p>
                      <p className="text-sm text-muted-foreground">
                        Payments are distributed monthly according to the next payment time displayed on the main page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Fees & Costs */}
            <section id="fees-costs" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">7</div>
                <h2 className="text-3xl font-bold">Fees & Costs</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Understanding Costs</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Submission Fees</h4>
                      <p className="text-sm text-muted-foreground">
                        Project submission requires a fee calculated based on:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Project duration (end date - start date)</li>
                        <li>• Number of existing projects</li>
                        <li>• Fee denominator set by the system</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Transaction Fees</h4>
                      <p className="text-sm text-muted-foreground">
                        Standard Koinos network fees apply for:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Voting transactions</li>
                        <li>• Project submissions</li>
                        <li>• Wallet operations</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Fee Calculation</h4>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Submission fees are calculated automatically and displayed before you submit your project.
                      Make sure you have enough KOIN to cover both the submission fee and transaction costs.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">8</div>
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">How do I get KOIN tokens?</h4>
                      <p className="text-sm text-muted-foreground">
                        You can purchase KOIN tokens from various exchanges or earn them through mining.
                        Visit the official Koinos website for more information about acquiring KOIN.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">Can I change my vote?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can change your vote percentage or vote for different projects at any time.
                        Your new vote will replace your previous vote for that project.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">What happens if my vote expires?</h4>
                      <p className="text-sm text-muted-foreground">
                        When your vote expires, it no longer counts toward the project&apos;s total votes.
                        You can renew your vote by voting again for the same project.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">Why was my project rejected?</h4>
                      <p className="text-sm text-muted-foreground">
                        Projects are not rejected by the system - they are submitted to the blockchain and
                        become available for community voting. Low community support may result in no funding.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">How are payments distributed?</h4>
                      <p className="text-sm text-muted-foreground">
                        Payments are distributed monthly based on vote rankings. Projects with higher votes
                        receive priority, and payments are made to the beneficiary address specified in the project.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium mb-2">Can I submit multiple projects?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can submit multiple projects. Each project requires its own submission fee
                        and will be evaluated independently by the community.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <section className="text-center py-12 border-t border-border/50">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Join the Koinos community and start participating in decentralized funding decisions.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => router.push('/')} className="h-12 px-6 rounded-xl">
                    <Zap className="w-4 h-4 mr-2" />
                    Explore Projects
                  </Button>
                  <Button variant="outline" className="h-12 px-6 rounded-xl" onClick={() => router.push('/submit')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}