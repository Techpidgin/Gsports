'use client';

import { useGames, useBaseBetslip, useSportsNavigation, useChain } from '@azuro-org/sdk';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MarketCard } from '@/components/market/market-card';
import { BetSlip } from '@/components/betslip/bet-slip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';

type TimeFilter = 'all' | 'today' | 'tomorrow' | '1h' | '3h' | '6h';

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: '1h', label: '1h' },
  { value: '3h', label: '3h' },
  { value: '6h', label: '6h' },
];

export default function MarketsPage() {
  const [sportId, setSportId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const isClient = useIsClient();
  const chain = useChain();
  const chainId = chain?.appChain?.id ?? DEFAULT_CHAIN_ID;
  const { data: nav } = useSportsNavigation({ chainId, query: { enabled: isClient } });
  const { data: games, isLoading, isSuccess, isError, refetch } = useGames({
    chainId,
    filter: { limit: 48, sportIds: sportId ? [sportId] : undefined },
    query: { enabled: isClient },
  });
  const { items, addItem, removeItem } = useBaseBetslip();

  const sports = nav ?? [];
  const q = searchQuery.trim().toLowerCase();

  const filteredGames = useMemo(() => {
    if (!games) return [];
    let list = games;
    if (q) {
      list = list.filter((g) => {
        const title = (g as { title?: string }).title ?? '';
        const sport = (g as { sport?: { name?: string } }).sport?.name ?? '';
        const league = (g as { league?: { name?: string } }).league?.name ?? '';
        const participants = (g as { participants?: Array<{ name?: string } | null> }).participants ?? [];
        const names = participants.map((p) => p?.name ?? '').join(' ');
        return `${title} ${sport} ${league} ${names}`.toLowerCase().includes(q);
      });
    }
    if (timeFilter !== 'all') {
      const now = Date.now() / 1000;
      const oneDay = 86400;
      const todayStart = Math.floor(now / oneDay) * oneDay;
      const todayEnd = todayStart + oneDay;
      const tomorrowEnd = todayEnd + oneDay;
      list = list.filter((g) => {
        const startsAt = Number((g as { startsAt?: string }).startsAt ?? 0);
        if (timeFilter === 'today') return startsAt >= todayStart && startsAt < todayEnd;
        if (timeFilter === 'tomorrow') return startsAt >= todayEnd && startsAt < tomorrowEnd;
        if (timeFilter === '1h') return startsAt >= now && startsAt <= now + 3600;
        if (timeFilter === '3h') return startsAt >= now && startsAt <= now + 3 * 3600;
        if (timeFilter === '6h') return startsAt >= now && startsAt <= now + 6 * 3600;
        return true;
      });
    }
    return list;
  }, [games, q, timeFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-64 shrink-0 rounded-xl border border-border/80 bg-card/60 p-3 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Link href="/live">
              <Button variant="ghost" size="sm" className="gap-2 w-full justify-start border border-border/60 bg-background/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                Live
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2 flex-1 justify-start border border-border/60 bg-background/40" disabled>
              <Clock className="h-4 w-4" />
              Upcoming
            </Button>
          </div>
          <nav className="space-y-0.5" aria-label="Sports">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground px-2 py-1">
              Sports
            </p>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-between font-normal border border-transparent hover:border-border/70',
                sportId === undefined && 'bg-muted border-border/70'
              )}
              onClick={() => setSportId(undefined)}
            >
              Top events
              {Array.isArray(nav) && (nav as { activeGamesCount?: number }[]).some((s) => s?.activeGamesCount != null) && (
                <span className="text-muted-foreground text-xs">
                  {(nav as { activeGamesCount?: number }[]).reduce((a, s) => a + (s?.activeGamesCount ?? 0), 0)}
                </span>
              )}
            </Button>
            {sports.slice(0, 14).map((sport) => {
              const s = sport as { id?: string; name?: string; activeGamesCount?: number };
              return (
                <Button
                  key={s?.id ?? ''}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-between font-normal border border-transparent hover:border-border/70',
                    sportId === s?.id && 'bg-muted border-border/70'
                  )}
                  onClick={() => setSportId(s?.id ?? undefined)}
                >
                  {s?.name ?? s?.id}
                  {s?.activeGamesCount != null && (
                    <span className="text-muted-foreground text-xs">{s.activeGamesCount}</span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search sport, league, event or team"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search markets"
          />
        </div>
        <div className="rounded-xl border border-border/80 bg-card/50 p-4">
          <h1 className="text-2xl font-bold">Sports Markets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Azuro runs on <strong>EVM chains only</strong> (Polygon, Gnosis, Chiliz, Base). Connect your <strong>EVM wallet</strong> and pick a chain in the header to see markets.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIME_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={timeFilter === f.value ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-52 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredGames.map((game) => (
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
                  <p className="text-muted-foreground mb-4">Couldn&apos;t load markets. Try switching chain or refresh.</p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}
            {!isLoading && isSuccess && filteredGames.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {games?.length === 0
                    ? `No events on chain ${chainId}. Pick a chain in the header (e.g. Polygon 137 or Polygon Amoy 80002) and ensure /api/subgraph returns OK.`
                    : 'No events match your search or time filter.'}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1">
            <BetSlip />
          </div>
        </div>
      </div>
    </div>
  );
}
