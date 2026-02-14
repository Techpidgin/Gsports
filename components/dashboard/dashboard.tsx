'use client';

import { useGames, useBaseBetslip, useBetTokenBalance, useChain, useNativeBalance } from '@azuro-org/sdk';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketCard, selectionKey } from '@/components/market/market-card';
import { BetSlip } from '@/components/betslip/bet-slip';
import { LiveGameOdds } from '@/components/dashboard/live-game-odds';
import { Trophy, Zap, Wallet, TrendingUp } from 'lucide-react';
import { formatTokenAmount, cn } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';
import { useUserBets } from '@/lib/use-user-bets';
import { useBalance } from 'wagmi';

function LiveStripImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const imgSrc = useFallback || !src ? '/logo.png' : src;
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      unoptimized
      onError={() => setUseFallback(true)}
    />
  );
}

const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;

function gasTokenSymbol(chainId: number) {
  if (chainId === 137 || chainId === 80002) return 'POL';
  if (chainId === 100) return 'xDAI';
  if (chainId === 8453 || chainId === 84532) return 'ETH';
  if (chainId === 88888 || chainId === 88882) return 'CHZ';
  return 'Gas';
}

const BANNER_SLIDES = ['/banner1.png', '/banner2.png'] as const;
const SLIDE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

function BannerSlideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BANNER_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative min-h-[280px] sm:min-h-[360px] md:min-h-[400px] w-full bg-muted/30">
      {BANNER_SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className={cn(
            'object-cover object-top transition-opacity duration-700',
            i === index ? 'opacity-100 z-0' : 'opacity-0 z-0'
          )}
        />
      ))}
      <div className="absolute inset-0 z-10 bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-6 pb-6 sm:pb-8 pointer-events-none">
        <p className="max-w-3xl text-base sm:text-lg md:text-xl text-white drop-shadow-lg leading-relaxed">
          Onchain decentralized prediction and sports markets. Suitable for agentic interactions — super fast, self cashout, no bans, no limits, no KYC.
        </p>
      </div>
    </div>
  );
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
    <div className="space-y-6 sm:space-y-8">
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
                    const homeImg = participants[0]?.image ?? null;
                    const awayImg = participants[1]?.image ?? null;
                    return (
                      <Link
                        href="/live"
                        key={`${loop}-${g.id}`}
                        className="relative flex h-12 min-w-[260px] items-center overflow-hidden rounded-md border border-border/70 bg-card/50 pl-2 pr-2 transition hover:border-primary/50 hover:bg-card/70"
                        title={`Open live markets for ${home} vs ${away}`}
                      >
                        <div className="absolute inset-0 grid grid-cols-2 opacity-35">
                          <div className="relative">
                            <LiveStripImage src={homeImg ?? ''} alt={home} className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
                          </div>
                          <div className="relative">
                            <LiveStripImage src={awayImg ?? ''} alt={away} className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/20 to-transparent" />
                          </div>
                        </div>
                        <div className="relative z-10 flex w-full items-center justify-between gap-2 text-xs">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="relative flex h-4 w-4 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-80" />
                              <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
                            </span>
                            <span className="truncate font-medium">{home} vs {away}</span>
                          </div>
                          <LiveGameOdds gameId={g.id} />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
        <h2 id="dashboard-heading" className="sr-only">
          Dashboard
        </h2>

        <div className="mb-6 lg:mb-8 overflow-hidden rounded-xl border border-border/70 bg-card/40">
          <Link href="/markets" className="block">
            <BannerSlideshow />
          </Link>
          <div className="relative overflow-hidden border-t border-border/60 bg-card/50">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <Image src="/logo.png" alt="" fill className="object-cover object-center" unoptimized />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.05] pointer-events-none">
              <Image src="/azuro.png" alt="" fill className="object-contain object-right" unoptimized />
            </div>
            <CardContent className="relative grid gap-2 p-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4 border-0 bg-transparent shadow-none">
              <div className="rounded-md border border-border/60 bg-background/30 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Wallet</p>
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm font-semibold mt-0.5">
                  {balance?.rawBalance != null ? formatTokenAmount(balance.rawBalance as bigint, 18) : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{gasTokenSymbol(chainId)} {nativeBalance?.rawBalance != null ? formatTokenAmount(nativeBalance.rawBalance as bigint, 18) : '—'}</p>
              </div>
              <div className="rounded-md border border-border/60 bg-background/30 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Markets</p>
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm font-semibold mt-0.5">{games?.length ?? 0}</p>
                <Link href="/markets">
                  <Button variant="link" className="p-0 h-auto text-primary text-[11px]">Browse all</Button>
                </Link>
              </div>
              <div className="rounded-md border border-border/60 bg-background/30 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active bets</p>
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm font-semibold mt-0.5">{address ? activeBets.length : '—'}</p>
                <Link href="/bets">
                  <Button variant="link" className="p-0 h-auto text-primary text-[11px]">Open activity</Button>
                </Link>
              </div>
              <div className="rounded-md border border-border/60 bg-background/30 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Settled</p>
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-sm font-semibold mt-0.5">{address ? settledBets.length : '—'}</p>
                {address ? (
                  <Link href="/history">
                    <Button variant="link" className="p-0 h-auto text-primary text-[11px]">View history</Button>
                  </Link>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Connect wallet</p>
                )}
              </div>
            </CardContent>
          </div>
        </div>
        {betsRefreshing && address && (
          <p className="text-xs text-muted-foreground">Syncing your activity...</p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-4 lg:col-span-2">
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
                  selectedSelectionKeys={new Set(items.map((i) => selectionKey(i.conditionId, i.outcomeId)))}
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
                No games on this chain. Switch chain (e.g. Polygon 137, Gnosis 100, or Base 8453) for active markets.
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
