'use client';

import { useBets, usePrecalculatedCashouts } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';

type BetForCashout = {
  tokenId: string;
  amount: string;
  outcomes: unknown[];
  status: string;
  totalOdds: number;
  freebetId: string | null;
};

function CashoutCard({ bet }: { bet: BetForCashout }) {
  const { data: cashout } = usePrecalculatedCashouts({
    // Bet from useBets has the required shape; type assertion for Pick<Bet, ...> compatibility
    bet: bet as Parameters<typeof usePrecalculatedCashouts>[0]['bet'],
  });

  return (
    <Card key={bet.tokenId}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Bet #{bet.tokenId.slice(0, 10)}…</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p>Stake: {bet.amount ?? '—'}</p>
        {cashout?.cashoutAmount != null && (
          <p>Cashout amount: {formatTokenAmount(BigInt(Math.floor(cashout.cashoutAmount)), 18)}</p>
        )}
        {cashout?.isAvailable ? (
          <Button size="sm" disabled>Cashout (use SDK useCashout)</Button>
        ) : (
          <p className="text-muted-foreground">Cashout not available for this bet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CashoutPage() {
  const { address } = useAccount();
  const { data, isLoading } = useBets({
    filter: { bettor: address! },
    query: { enabled: Boolean(address) },
  });
  const bets = data?.pages?.flatMap((p) => p.bets) ?? [];
  const activeBets = bets.filter((b) => !b.isWin && !b.isLose && !b.isRedeemed);

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cashout</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to see cashout options for active bets.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cashout</h1>
      <p className="text-muted-foreground">
        Cash out active bets early. Available when Azuro supports cashout on this chain.
      </p>

      {isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : (
        <div className="space-y-4">
          {activeBets.map((bet) => (
            <CashoutCard key={bet.tokenId} bet={bet} />
          ))}
        </div>
      )}

      {!isLoading && activeBets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active bets to cash out.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
