'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';
import { useUserBets } from '@/lib/use-user-bets';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { address, bets, settledBets, activeBets, wonBets, lostBets, isLoading, refetch } = useUserBets();

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Activity</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to see bet history and stats.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground">Clear view of your settled and active bets.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{bets.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Won</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {wonBets.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {lostBets.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section aria-labelledby="settled-heading">
            <h2 id="settled-heading" className="text-lg font-semibold mb-4">Settled</h2>
            <div className="space-y-3">
              {settledBets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No settled bets yet.</p>
              ) : (
                settledBets.map((bet) => (
                  <Card key={bet.tokenId}>
                    <CardContent className="py-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>#{bet.tokenId.slice(0, 8)}…</span>
                      <span>{bet.isWin ? 'Won' : bet.isLose ? 'Lost' : bet.isRedeemed ? 'Redeemed' : 'Active'}</span>
                      <span>Stake: {bet.amount ?? '—'}</span>
                      {bet.payout != null && <span>Payout: {formatTokenAmount(BigInt(bet.payout), 18)}</span>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section aria-labelledby="active-heading">
            <h2 id="active-heading" className="text-lg font-semibold mb-4">Active</h2>
            <div className="space-y-3">
              {activeBets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active bets.</p>
              ) : (
                activeBets.map((bet) => (
                  <Card key={bet.tokenId}>
                    <CardContent className="py-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>#{bet.tokenId.slice(0, 8)}…</span>
                      <span>{bet.isWin ? 'Won' : bet.isLose ? 'Lost' : bet.isRedeemed ? 'Redeemed' : 'Active'}</span>
                      <span>Stake: {bet.amount ?? '—'}</span>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
