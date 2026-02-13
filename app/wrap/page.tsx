'use client';

import { useWrapTokens, useBetTokenBalance, useNativeBalance } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { toast } from 'sonner';

export default function WrapPage() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const { data: betTokenBalance } = useBetTokenBalance();
  const { data: nativeBalance } = useNativeBalance();
  const { wrap, unwrap, wrapTx, unwrapTx } = useWrapTokens();
  const wrapPending = wrapTx.isPending || wrapTx.isProcessing;
  const unwrapPending = unwrapTx.isPending || unwrapTx.isProcessing;

  const amountNum = parseFloat(amount) || 0;

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Wrap / Unwrap</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to wrap native token to bet token (or unwrap).
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wrap / Unwrap</h1>
      <p className="text-muted-foreground">
        Wrap native token (e.g. xDAI, MATIC, WETH) to bet token to place bets. Unwrap to get native back.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balances</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Native: {nativeBalance != null ? formatTokenAmount(nativeBalance.rawBalance as bigint, 18) : '—'}</p>
            <p>Bet token: {betTokenBalance?.rawBalance != null ? formatTokenAmount(betTokenBalance.rawBalance as bigint, 18) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wrap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="wrap-amount" className="text-sm font-medium">Amount (native)</label>
              <Input
                id="wrap-amount"
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                disabled={amountNum <= 0 || wrapPending || unwrapPending}
                onClick={async () => {
                  try {
                    await wrap(amount);
                    toast.success('Wrapped');
                    setAmount('');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Wrap failed');
                  }
                }}
              >
                {wrapPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Wrap'}
              </Button>
              <Button
                variant="outline"
                disabled={amountNum <= 0 || wrapPending || unwrapPending}
                onClick={async () => {
                  try {
                    await unwrap(amount);
                    toast.success('Unwrapped');
                    setAmount('');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Unwrap failed');
                  }
                }}
              >
                {unwrapPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unwrap'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
