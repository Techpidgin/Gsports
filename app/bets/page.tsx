'use client';

import { useRedeemBet } from '@azuro-org/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatTokenAmount } from '@/lib/utils';
import { useUserBets } from '@/lib/use-user-bets';

export default function BetsPage() {
  const { address, bets, isLoading, isRefreshing, refetch } = useUserBets();
  const { submit: redeemSubmit, isPending } = useRedeemBet();

  const handleRedeem = async (bet: { tokenId: string; coreAddress: string; lpAddress: string; freebetId: string | null; paymaster: string | null }) => {
    try {
      await redeemSubmit({
        bets: [{
          tokenId: bet.tokenId,
          coreAddress: bet.coreAddress as `0x${string}`,
          lpAddress: bet.lpAddress as `0x${string}`,
          freebetId: bet.freebetId,
          paymaster: bet.paymaster as `0x${string}` | null,
        }],
      });
      toast.success('Bet redeemed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Redeem failed');
    }
  };

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Bets</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to see bet history and redeem winnings.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bets</h1>
      <p className="text-muted-foreground">
        Activity synced from your wallet. Redeem available winnings directly.
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {bets?.map((bet) => {
            const canRedeem = bet.isRedeemable && !bet.isRedeemed;
            return (
              <Card key={bet.tokenId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Bet #{bet.tokenId.slice(0, 10)}…</span>
                    <span className="text-sm font-normal text-muted-foreground">{bet.status}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Stake: {bet.amount ?? '—'}</p>
                  <p>Odds: {bet.totalOdds != null ? bet.totalOdds.toFixed(2) : '—'}</p>
                  {bet.payout != null && <p>Payout: {formatTokenAmount(BigInt(bet.payout), 18)}</p>}
                  {canRedeem && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRedeem({ tokenId: bet.tokenId, coreAddress: bet.coreAddress, lpAddress: bet.lpAddress, freebetId: bet.freebetId, paymaster: bet.paymaster })}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isRefreshing && !isLoading && (
        <p className="text-xs text-muted-foreground">Refreshing latest on-chain activity...</p>
      )}

      {!isLoading && bets.length > 0 && (
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh activity
        </Button>
      )}

      {!isLoading && (!bets || bets.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bets yet. Place a bet from Markets or Dashboard.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
