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
import { useBetTokenBalance, useChain, useNativeBalance } from '@azuro-org/sdk';
import { formatTokenAmount } from '@/lib/utils';
import { useBalance } from 'wagmi';

const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;

function gasTokenSymbol(chainId: number) {
  if (chainId === 137 || chainId === 80002) return 'POL';
  if (chainId === 100) return 'xDAI';
  if (chainId === 8453 || chainId === 84532) return 'ETH';
  if (chainId === 88888 || chainId === 88882) return 'CHZ';
  return 'Gas';
}

export function WalletButton({ className }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const [copied, setCopied] = useState(false);
  const [evmOpen, setEvmOpen] = useState(false);
  const chain = useChain();
  const chainId = chain?.appChain?.id;
  const { data: betTokenBalance } = useBetTokenBalance();
  const { data: nativeBalance } = useNativeBalance();
  const isPolygon = chainId === 137 || chainId === 80002;
  const { data: usdtBalance } = useBalance({
    address,
    token: isPolygon ? POLYGON_USDT : undefined,
    query: { enabled: Boolean(address) && isPolygon },
  });

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
          <div className="space-y-1 px-2 py-1.5 text-xs">
            <div className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Bet token</span>
              <span className="font-medium text-foreground">
                {betTokenBalance?.rawBalance != null ? formatTokenAmount(betTokenBalance.rawBalance as bigint, 18) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>{gasTokenSymbol(chainId ?? 0)} (gas)</span>
              <span className="font-medium text-foreground">
                {nativeBalance?.rawBalance != null ? formatTokenAmount(nativeBalance.rawBalance as bigint, 18) : '—'}
              </span>
            </div>
            {isPolygon && (
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>USDT</span>
                <span className="font-medium text-foreground">{usdtBalance?.formatted ?? '—'}</span>
              </div>
            )}
          </div>
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
