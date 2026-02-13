'use client';

import { useGames, useBaseBetslip, useBetTokenBalance, useChain } from '@azuro-org/sdk';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketCard } from '@/components/market/market-card';
import { BetSlip } from '@/components/betslip/bet-slip';
import { Trophy, Zap, Wallet, TrendingUp } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';
import { useUserBets } from '@/lib/use-user-bets';

export function Dashboard() {
  const isClient = useIsClient();
  const chain = useChain();
  const chainId = chain?.appChain?.id ?? DEFAULT_CHAIN_ID;
  const { data: games, isLoading, isSuccess, isError, error, refetch } = useGames({
    chainId,
    filter: { limit: 12 },
    query: { enabled: isClient },
  });
  const { items, addItem, removeItem } = useBaseBetslip();
  const { data: balance } = useBetTokenBalance();
  const { address, activeBets, settledBets, isRefreshing: betsRefreshing } = useUserBets();

  return (
    <div className="space-y-8">
      <section aria-labelledby="dashboard-heading">
        <h1 id="dashboard-heading" className="text-3xl font-bold mb-2">
          Gibisbig
        </h1>
        <p className="text-muted-foreground mb-2">
          Decentralized betting on Azuro. Markets run on <strong>EVM chains only</strong>: Polygon, Gnosis, Chiliz, Base.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Connect your <strong>EVM wallet</strong> (MetaMask, etc.) and pick a chain in the header to see games. Solana wallet is optional for future features; Azuro does not run on Solana.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bet token balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {balance?.rawBalance != null
                    ? formatTokenAmount(balance.rawBalance as bigint, 18)
                    : '—'}
                </p>
              </CardContent>
            </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Markets</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{games?.length ?? 0}</p>
                <Link href="/markets">
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Browse all
                  </Button>
                </Link>
              </CardContent>
            </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active bets</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{address ? activeBets.length : '—'}</p>
                <Link href="/bets">
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Open activity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Settled bets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{address ? settledBets.length : '—'}</p>
                {address ? (
                  <Link href="/history">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View history
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">Connect wallet to load your data</p>
                )}
              </CardContent>
            </Card>
        </div>
        {betsRefreshing && address && (
          <p className="text-xs text-muted-foreground">Syncing your activity...</p>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Top markets</h2>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(games ?? []).slice(0, 6).map((game) => (
                <MarketCard
                  key={game.id}
                  game={game}
                  onAddSelection={addItem}
                  onRemoveSelection={removeItem}
                  selectedOutcomeIds={items.map((o) => o.outcomeId)}
                />
              ))}
            </div>
          )}
          {!isLoading && isError && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-2">Couldn&apos;t load markets. Try switching chain or refresh.</p>
                {error?.message && <p className="text-sm text-destructive mb-2">{error.message}</p>}
                <p className="text-xs text-muted-foreground mb-4">
                  If you see &quot;Failed to fetch&quot;, open{' '}
                  <a href="/api/subgraph" target="_blank" rel="noopener noreferrer" className="underline">
                    /api/subgraph
                  </a>{' '}
                  in a new tab. If it shows &#123;&quot;ok&quot;: true&#125;, the proxy is reachable.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
          {!isLoading && isSuccess && (!games || games.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No games on this chain. Switch chain (e.g. Polygon Amoy) for testnet markets.
              </CardContent>
            </Card>
          )}
        </div>
        <div className="lg:col-span-1">
          <BetSlip />
        </div>
      </div>
    </div>
  );
}
