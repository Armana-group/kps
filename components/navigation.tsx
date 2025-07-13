"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KoinosLogo } from "@/components/koinos-logo";
import { WalletConnect } from "@/components/wallet-connect";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Submit Project", href: "/submit" },
    { label: "Documentation", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center">

        {/* Logo - Left (1/3) */}
        <div className="flex items-center gap-3 w-1/3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <KoinosLogo width={32} height={31} />
            <span className="text-xl font-semibold font-display">KFS</span>
          </Link>
        </div>

        {/* Navigation Links - Center (1/3) */}
        <nav className="hidden md:grid grid-cols-3 gap-8 place-items-center w-1/3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions - Right (1/3) */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <WalletConnect />
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

             {/* Mobile Menu */}
       {isMobileMenuOpen && (
         <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
           <div className="px-6 py-4 space-y-4">
             {navLinks.map((link) => {
               const isActive = pathname === link.href;
               return (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => setIsMobileMenuOpen(false)}
                   className={cn(
                     "block text-sm font-medium transition-colors",
                     isActive
                       ? "text-foreground"
                       : "text-muted-foreground hover:text-foreground"
                   )}
                 >
                   {link.label}
                 </Link>
               );
             })}
           </div>
         </div>
       )}
    </header>
  );
}