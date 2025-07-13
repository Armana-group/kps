"use client";

import { SubmitProjectForm } from '@/components/submit-project-form';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const router = useRouter();

  const handleSubmissionSuccess = () => {
    // Redirect to home page after successful submission
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 tracking-tight">
              Submit your project
            </h1>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Instructions */}
            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-bold mb-4">How it works</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Your project proposal is only shared with the community after you submit it for voting.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">📝 Project Details</h3>
                                      <p className="text-muted-foreground">
                      Provide a clear title, description, and specify the funding amount you&apos;re requesting for your project.
                    </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">🗳️ Community Voting</h3>
                  <p className="text-muted-foreground">
                    Once submitted, the community will vote on your proposal. Projects with sufficient support will be funded.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">💰 Funding</h3>
                  <p className="text-muted-foreground">
                    Approved projects receive funding directly to help bring your ideas to life and benefit the Koinos ecosystem.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-3xl bg-card p-2 md:p-4">
                <SubmitProjectForm onSuccess={handleSubmissionSuccess} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}