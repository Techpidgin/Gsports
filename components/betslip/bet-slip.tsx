'use client';

import { useBaseBetslip, useDetailedBetslip, useBet, useBetFee, useMaxBet, useBetTokenBalance, useGame, useConditions } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { formatOdds, formatTokenAmount } from '@/lib/utils';
import { getConditionMarketName, getOutcomeDisplayLabel } from '@/lib/outcome-labels';

type TicketItem = {
  outcomeId: string;
  conditionId: string;
  gameId: string;
};

function formatTinyDate(unix: string | null | undefined) {
  if (!unix) return 'TBD';
  const d = new Date(Number(unix) * 1000);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

function TicketSelectionRow({
  item,
  oddLabel,
  onRemove,
}: {
  item: TicketItem;
  oddLabel: string;
  onRemove: () => void;
}) {
  const { data: game } = useGame({ gameId: item.gameId });
  const { data: conditions } = useConditions({ gameId: item.gameId });

  const participants = (game as { participants?: Array<{ name?: string } | null> } | undefined)?.participants ?? [];
  const home = participants[0]?.name ?? 'Home';
  const away = participants[1]?.name ?? 'Away';
  const startsAt = (game as { startsAt?: string } | undefined)?.startsAt;
  const condition = conditions?.find((c) => c.id === item.conditionId);
  const outcomes = condition?.outcomes ?? [];
  const idx = outcomes.findIndex((o) => o.outcomeId === item.outcomeId);
  const selectedOutcome = outcomes[idx];
  const marketName = getConditionMarketName(item.outcomeId);
  const outcomeName = selectedOutcome
    ? getOutcomeDisplayLabel({
        outcomeId: item.outcomeId,
        title: selectedOutcome.title ?? undefined,
        outcomeIndex: idx >= 0 ? idx : 0,
        totalOutcomes: outcomes.length,
        marketName,
      })
    : 'Outcome';

  return (
    <li className="rounded-md border border-border/60 bg-background/40 p-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{home} vs {away}</span>
        <span className="ibm-plex-mono-medium text-muted-foreground">{oddLabel}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">{marketName ? `${marketName}: ${outcomeName}` : outcomeName}</span>
        <span className="ibm-plex-mono-regular">{formatTinyDate(startsAt)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate ibm-plex-mono-light">Cond {item.conditionId.slice(0, 10)}…</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove} aria-label={`Remove ${item.outcomeId}`}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </li>
  );
}

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
  const ticketRef = items.length > 0 ? `#${items[0].conditionId.slice(0, 4)}${items.length}${items[items.length - 1].outcomeId.slice(-3)}` : '#----';

  return (
    <Card className="sticky top-24 overflow-hidden border-primary/30 bg-card/95">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-around">
        {[...Array(9)].map((_, i) => (
          <span key={`left-${i}`} className="h-3 w-3 -translate-x-1/2 rounded-full bg-background" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-around">
        {[...Array(9)].map((_, i) => (
          <span key={`right-${i}`} className="h-3 w-3 translate-x-1/2 rounded-full bg-background" />
        ))}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            Betslip
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">
              Ticket
            </span>
          </span>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} aria-label="Clear betslip">
              Clear
            </Button>
          )}
        </CardTitle>
        <div className="flex items-center justify-between border-t border-dashed border-border/70 pt-2 text-xs text-muted-foreground">
          <span>Ref {ticketRef}</span>
          <span>{items.length} pick{items.length === 1 ? '' : 's'}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Add selections from markets to place a bet.</p>
        ) : (
          <>
            <ul className="space-y-2" aria-label="Selections">
              {items.map((item) => (
                <TicketSelectionRow
                  key={`${item.conditionId}-${item.outcomeId}`}
                  item={item as TicketItem}
                  oddLabel={odds?.[item.outcomeId] != null ? formatOdds(odds[item.outcomeId]) : '—'}
                  onRemove={() => removeItem({ outcomeId: item.outcomeId, conditionId: item.conditionId })}
                />
              ))}
            </ul>
            <div className="space-y-1 rounded-md border border-dashed border-border/70 bg-background/30 p-2">
              <p className="text-xs text-muted-foreground">Combined odds</p>
              <p className="text-base font-semibold tabular-nums">{formatOdds(totalOdds)}</p>
            </div>

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
            {stakeNum > 0 && (
              <div className="rounded-md border border-primary/30 bg-primary/10 p-2">
                <p className="text-xs text-muted-foreground">Potential win</p>
                <p className="text-base font-semibold">{potentialWin.toFixed(2)}</p>
              </div>
            )}

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
