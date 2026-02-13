'use client';

import { useGames, useBaseBetslip, useBetTokenBalance, useChain, useNativeBalance } from '@azuro-org/sdk';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketCard } from '@/components/market/market-card';
import { BetSlip } from '@/components/betslip/bet-slip';
import { Trophy, Zap, Wallet, TrendingUp } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';
import { useUserBets } from '@/lib/use-user-bets';
import { APP_CONFIG, ZERO_ADDRESS } from '@/lib/app-config';
import { useBalance } from 'wagmi';

const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;

function gasTokenSymbol(chainId: number) {
  if (chainId === 137 || chainId === 80002) return 'POL';
  if (chainId === 100) return 'xDAI';
  if (chainId === 8453 || chainId === 84532) return 'ETH';
  if (chainId === 88888 || chainId === 88882) return 'CHZ';
  return 'Gas';
}

export function Dashboard() {
  const isClient = useIsClient();
  const chain = useChain();
  const chainId = chain?.appChain?.id ?? DEFAULT_CHAIN_ID;
  const { data: games, isLoading, isSuccess, isError, error, refetch } = useGames({
    chainId,
    filter: { limit: 12 },
    query: { enabled: isClient },
  });
  const { data: liveGames } = useGames({
    chainId,
    isLive: true,
    filter: { limit: 10 },
    query: { enabled: isClient },
  });
  const { items, addItem, removeItem } = useBaseBetslip();
  const { data: balance } = useBetTokenBalance();
  const { data: nativeBalance } = useNativeBalance();
  const { address, activeBets, settledBets, isRefreshing: betsRefreshing } = useUserBets();
  const isPolygon = chainId === 137 || chainId === 80002;
  const { data: usdtBalance } = useBalance({
    address,
    token: isPolygon ? POLYGON_USDT : undefined,
    query: { enabled: Boolean(address) && isPolygon },
  });

  return (
    <div className="space-y-8">
      <section aria-labelledby="dashboard-heading">
        <div className="mb-4 overflow-hidden rounded-xl border border-border/70 bg-background/35">
          <div className="marquee-track py-3">
            {[...Array(2)].map((_, loop) => (
              <div key={loop} className="inline-flex items-center gap-3 px-4">
                {(liveGames ?? []).length === 0 ? (
                  <span className="text-xs text-muted-foreground">No live events right now. Switch chain to view more live markets.</span>
                ) : (
                  (liveGames ?? []).map((g) => {
                    const participants = (g as { participants?: Array<{ name?: string; image?: string | null } | null> }).participants ?? [];
                    const home = participants[0]?.name ?? 'Home';
                    const away = participants[1]?.name ?? 'Away';
                    const homeImg = participants[0]?.image ?? '/logo.png';
                    const awayImg = participants[1]?.image ?? '/logo.png';
                    return (
                      <Link
                        href="/live"
                        key={`${loop}-${g.id}`}
                        className="relative flex h-12 min-w-[220px] items-center overflow-hidden rounded-md border border-border/70 bg-card/50 pr-2 transition hover:border-primary/50 hover:bg-card/70"
                        title={`Open live markets for ${home} vs ${away}`}
                      >
                        <div className="absolute inset-0 grid grid-cols-2 opacity-35">
                          <div className="relative">
                            <Image src={homeImg} alt="" fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
                          </div>
                          <div className="relative">
                            <Image src={awayImg} alt="" fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/20 to-transparent" />
                          </div>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 px-2 text-xs">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-80" />
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
                          </span>
                          <span className="font-medium">{home} vs {away}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
        <h1 id="dashboard-heading" className="text-3xl font-bold mb-2">
          Gibisbig
        </h1>
        <p className="text-muted-foreground mb-2">
          Decentralized betting on Azuro. Markets run on <strong>EVM chains only</strong>: Polygon, Gnosis, Chiliz, Base.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Connect your <strong>EVM wallet</strong> (MetaMask, etc.) and pick a chain in the header to see games. Solana wallet is optional for future features; Azuro does not run on Solana.
        </p>
        <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-border/70 px-2 py-0.5">Promo: {APP_CONFIG.promoCampaignId}</span>
          {APP_CONFIG.ownerAddress !== ZERO_ADDRESS && (
            <span className="rounded-full border border-border/70 px-2 py-0.5">
              Owner: {APP_CONFIG.ownerAddress.slice(0, 8)}...{APP_CONFIG.ownerAddress.slice(-4)}
            </span>
          )}
          {APP_CONFIG.treasuryAddress !== ZERO_ADDRESS && (
            <span className="rounded-full border border-border/70 px-2 py-0.5">
              Treasury: {APP_CONFIG.treasuryAddress.slice(0, 8)}...{APP_CONFIG.treasuryAddress.slice(-4)}
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet assets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bet token</span>
                  <span className="font-semibold">
                    {balance?.rawBalance != null ? formatTokenAmount(balance.rawBalance as bigint, 18) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{gasTokenSymbol(chainId)} (gas)</span>
                  <span className="font-semibold">
                    {nativeBalance?.rawBalance != null ? formatTokenAmount(nativeBalance.rawBalance as bigint, 18) : '—'}
                  </span>
                </div>
                {isPolygon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">USDT</span>
                    <span className="font-semibold">{usdtBalance?.formatted ?? '—'}</span>
                  </div>
                )}
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
