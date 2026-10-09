"use client";

import { useState } from 'react';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Check, ExternalLink, LogOut } from 'lucide-react';
import { shortAddress } from '@/lib/format';

export function UserMenu() {
  const { address, disconnect } = useKondorWalletContext();
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-paper transition-opacity hover:opacity-85"
          aria-label={`Connected wallet ${address}`}
        >
          <span className="mono font-medium">{shortAddress(address)}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 rounded-[20px] border-line p-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,.25)]">
        <div className="px-3 pb-2 pt-2">
          <p className="text-sm font-semibold">Connected with Kondor</p>
          <p className="mono mt-1 break-all text-ink-2">{address}</p>
        </div>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer rounded-xl px-3 py-2.5">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy address'}
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5">
          <a href={`https://koinscan.com/address/${address}`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            View on KoinScan
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem onClick={disconnect} className="cursor-pointer rounded-xl px-3 py-2.5">
          <LogOut className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
