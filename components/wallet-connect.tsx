"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useKondorWallet } from '@/hooks/useKondorWallet';
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react';

export function WalletConnect() {
  const {
    isConnected,
    address,
    isKondorInstalled,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useKondorWallet();

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

  if (!isKondorInstalled) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="text-sm"
          onClick={() => window.open('https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Install Kondor
        </Button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">
            {truncateAddress(address)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCopyAddress}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-sm text-red-500 mr-2">
          {error}
        </div>
      )}
      <Button 
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
} 