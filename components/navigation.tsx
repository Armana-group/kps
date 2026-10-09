"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { KoinosLogo } from "@/components/koinos-logo";
import { WalletConnect } from "@/components/wallet-connect";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderSlotTarget } from "@/components/header-slot";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Projects", href: "/" },
  { label: "Submit a project", href: "/submit" },
  { label: "Docs", href: "/docs" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the phone menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center gap-10 lg:h-[76px]">
        <Link href="/" className="flex items-center gap-3 text-[16px] font-semibold tracking-[-0.01em]" aria-label="Koinos Fund System home">
          <KoinosLogo />
          KFS
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn("transition-colors hover:text-ink", active ? "text-ink" : "text-ink-2")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <HeaderSlotTarget className="contents" />
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full border border-line-strong text-ink md:hidden"
          >
            {open ? <X className="size-4" strokeWidth={1.8} /> : <Menu className="size-4" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="wrap border-t border-line pb-6 pt-2 md:hidden">
          <nav className="flex flex-col" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("py-3 text-lg font-medium", pathname === link.href ? "text-ink" : "text-ink-2")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 sm:hidden">
            <WalletConnect />
          </div>
        </div>
      )}
    </header>
  );
}
