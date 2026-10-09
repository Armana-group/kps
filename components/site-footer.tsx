import Link from "next/link";
import { FUND_ADDRESS } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="wrap mt-24 lg:mt-32">
      <div className="flex flex-col gap-4 border-t border-line py-9 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <Link href="/docs" className="hover:text-ink">Docs</Link>
          <Link href="/submit" className="hover:text-ink">Submit a project</Link>
          <a href="https://github.com/armana-group" target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
          <a href="https://koinscan.com" target="_blank" rel="noreferrer" className="hover:text-ink">KoinScan</a>
        </nav>
        <p>
          Fund contract{" "}
          <a href={`https://koinscan.com/address/${FUND_ADDRESS}`} target="_blank" rel="noreferrer" className="mono hover:text-ink">
            {FUND_ADDRESS}
          </a>
        </p>
      </div>
    </footer>
  );
}
