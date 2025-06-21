"use client";

import { useState } from 'react';
import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  Wallet,
  ChevronDown
} from 'lucide-react';

export function UserMenu() {
  const { address, disconnect } = useKondorWalletContext();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };



  if (!address) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-xl hover:bg-secondary/70 transition-all duration-200 group">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium font-mono">
            {truncateAddress(address)}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Connected Wallet</span>
            <span className="text-xs text-muted-foreground font-mono">
              {truncateAddress(address)}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 mr-3 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-3" />
          )}
          {copied ? 'Address Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => window.open('https://www.koinscan.io/address/' + address, '_blank')} 
          className="cursor-pointer"
        >
          <Wallet className="w-4 h-4 mr-3" />
          View on Koinscan
          <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnect} 
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 