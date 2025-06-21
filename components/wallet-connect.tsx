"use client";

import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import { Wallet, ExternalLink } from 'lucide-react';

export function WalletConnect() {
  const {
    isConnected,
    isKondorInstalled,
    isConnecting,
    error,
    connect,
  } = useKondorWalletContext();

  if (!isKondorInstalled) {
    return (
      <Button 
        variant="outline" 
        className="h-10 px-4 rounded-xl font-medium text-sm border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        onClick={() => window.open('https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl', '_blank')}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Install Kondor
      </Button>
    );
  }

  if (isConnected) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0"></div>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
      <Button 
        onClick={connect}
        disabled={isConnecting}
        className="h-10 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
} 