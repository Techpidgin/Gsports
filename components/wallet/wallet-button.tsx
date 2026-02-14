'use client';

import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function WalletButton({ className }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const [copied, setCopied] = useState(false);
  const [evmOpen, setEvmOpen] = useState(false);

  const displayAddress = address;

  const handleCopy = () => {
    if (!displayAddress) return;
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnectEVM = () => disconnect();

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('h-11 gap-2', className)}>
            <Wallet className="h-4 w-4" aria-hidden />
            {displayAddress ? shortenAddress(displayAddress) : 'Connected'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              {isConnected && <span className="text-xs text-muted-foreground">EVM</span>}
              {displayAddress && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-left text-sm font-mono flex items-center gap-2 hover:opacity-80"
                >
                  {shortenAddress(displayAddress, 8)}
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isConnected && (
            <DropdownMenuItem onClick={handleDisconnectEVM}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect EVM
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Dialog open={evmOpen} onOpenChange={setEvmOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="h-11 gap-2 w-full">
            <Wallet className="h-4 w-4" aria-hidden />
            Connect EVM
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect EVM wallet</DialogTitle>
            <DialogDescription>Choose a wallet to use with Azuro on supported chains.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  connect({ connector });
                  setEvmOpen(false);
                }}
              >
                {connector.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
