'use client';

import { useBaseBetslip, useDetailedBetslip, useBet, useBetFee, useMaxBet, useBetTokenBalance } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { formatOdds, formatTokenAmount } from '@/lib/utils';

export function BetSlip() {
  const { address } = useAccount();
  const { items, removeItem, clear } = useBaseBetslip();
  const { betAmount, changeBetAmount, totalOdds, odds } = useDetailedBetslip();
  const { data: fee } = useBetFee();
  const { data: maxBet } = useMaxBet({ selections: items });
  const { data: balance } = useBetTokenBalance();
  const selections = items.map((i) => ({ outcomeId: i.outcomeId, conditionId: i.conditionId }));
  const onSuccess = useCallback(() => {
    toast.success('Bet placed successfully');
    clear();
    changeBetAmount('');
  }, [clear, changeBetAmount]);
  const { submit, betTx: betTxState } = useBet({
    betAmount,
    slippage: 1,
    affiliate: (process.env.NEXT_PUBLIC_AFFILIATE_ADDRESS as `0x${string}`) ?? '0x0000000000000000000000000000000000000000',
    selections,
    odds: odds ?? {},
    totalOdds,
    onSuccess,
  });

  const stakeNum = parseFloat(betAmount) || 0;
  const potentialWin = stakeNum * totalOdds;
  const balanceFormatted = balance?.rawBalance != null ? formatTokenAmount(balance.rawBalance as bigint, 18) : '0';
  const isPending = betTxState?.isPending ?? betTxState?.isProcessing ?? false;

  return (
    <Card className="sticky top-24 border-primary/20 bg-card/95">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Betslip
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} aria-label="Clear betslip">
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Add selections from markets to place a bet.</p>
        ) : (
          <>
            <ul className="space-y-2" aria-label="Selections">
              {items.map((item) => (
                <li key={`${item.conditionId}-${item.outcomeId}`} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate">{item.outcomeId.slice(0, 8)}…</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{odds?.[item.outcomeId] != null ? formatOdds(odds[item.outcomeId]) : '—'}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeItem({ outcomeId: item.outcomeId, conditionId: item.conditionId })}
                      aria-label={`Remove ${item.outcomeId}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium">Combined odds: {formatOdds(totalOdds)}</p>

            <div className="space-y-2">
              <label htmlFor="stake" className="text-sm font-medium">
                Stake
              </label>
              <Input
                id="stake"
                type="number"
                min={0}
                step="any"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => changeBetAmount(e.target.value)}
                aria-describedby="stake-hint"
              />
              <p id="stake-hint" className="text-xs text-muted-foreground">
                Balance: {balanceFormatted}
                {maxBet != null && ` • Max: ${maxBet}`}
              </p>
            </div>

            {fee?.formattedRelayerFeeAmount && stakeNum > 0 && (
              <p className="text-xs text-muted-foreground">Fee: {fee.formattedRelayerFeeAmount}</p>
            )}
            {stakeNum > 0 && <p className="text-sm font-medium">Potential win: {potentialWin.toFixed(2)}</p>}

            <Button
              className="w-full"
              disabled={!address || items.length === 0 || stakeNum <= 0 || isPending}
              onClick={() => submit()}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Placing…
                </>
              ) : (
                'Place bet'
              )}
            </Button>
            {!address && <p className="text-xs text-muted-foreground text-center">Connect EVM wallet to place bets.</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
