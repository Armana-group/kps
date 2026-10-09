"use client";

import { useKondorWalletContext } from '@/contexts/KondorWalletContext';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import { Loader2 } from 'lucide-react';

export function WalletConnect() {
  const { isConnected, isKondorInstalled, isConnecting, connect } = useKondorWalletContext();

  if (!isKondorInstalled) {
    return (
      <Button variant="outline" size="sm" className="h-10" asChild>
        <a href="https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl" target="_blank" rel="noreferrer">
          Install Kondor
        </a>
      </Button>
    );
  }

  if (isConnected) {
    return <UserMenu />;
  }

  return (
    <Button variant="secondary" size="sm" className="h-10" onClick={connect} disabled={isConnecting}>
      {isConnecting && <Loader2 className="animate-spin" />}
      Connect wallet
    </Button>
  );
}
