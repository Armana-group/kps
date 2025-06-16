import { ThemeToggle } from "@/components/theme-toggle";
import { KoinosLogo } from "@/components/koinos-logo";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Logo in top-left corner */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <KoinosLogo width={40} height={39} />
        <span className="text-2xl font-medium">KPS</span>
      </div>
      
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-wider bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
          KOINOS PROPOSAL SYSTEM (KPS)
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed">
          Governance proposals for the Koinos blockchain. A modern platform for community-driven decision making.
        </p>
      </div>
    </div>
  );
}
