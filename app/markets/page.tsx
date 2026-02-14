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
import Image from 'next/image';
import { Search, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';
import { APP_CONFIG } from '@/lib/app-config';

type TimeFilter = 'all' | 'today' | 'tomorrow' | '1h' | '3h' | '6h';

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: '1h', label: '1h' },
  { value: '3h', label: '3h' },
  { value: '6h', label: '6h' },
];

const COUNTRY_TO_ISO: Record<string, string> = {
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  ireland: 'IE',
  france: 'FR',
  germany: 'DE',
  spain: 'ES',
  italy: 'IT',
  portugal: 'PT',
  netherlands: 'NL',
  belgium: 'BE',
  switzerland: 'CH',
  austria: 'AT',
  sweden: 'SE',
  norway: 'NO',
  denmark: 'DK',
  finland: 'FI',
  poland: 'PL',
  croatia: 'HR',
  serbia: 'RS',
  turkey: 'TR',
  greece: 'GR',
  czech: 'CZ',
  slovakia: 'SK',
  ukraine: 'UA',
  romania: 'RO',
  brazil: 'BR',
  argentina: 'AR',
  uruguay: 'UY',
  mexico: 'MX',
  usa: 'US',
  canada: 'CA',
  australia: 'AU',
  japan: 'JP',
  korea: 'KR',
  china: 'CN',
  india: 'IN',
  nigeria: 'NG',
  'south africa': 'ZA',
  morocco: 'MA',
};

function isoToFlag(iso: string) {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

function extractCountryAndLeague(leagueName: string) {
  const normalized = leagueName.trim();
  if (!normalized) return { country: 'International', league: 'Unknown', flag: '🌍' };
  const separators = [' - ', ' | ', ': ', ' / ', ', '];
  let firstPart = normalized;
  for (const sep of separators) {
    if (normalized.includes(sep)) {
      firstPart = normalized.split(sep)[0].trim();
      break;
    }
  }
  const key = firstPart.toLowerCase();
  const iso = COUNTRY_TO_ISO[key];
  if (iso) {
    let league = normalized.replace(new RegExp(`^${firstPart}[\\s\\-|:,/]*`, 'i'), '').trim();
    if (!league) league = normalized;
    return { country: firstPart, league, flag: isoToFlag(iso) };
  }
  return { country: 'International', league: normalized, flag: '🌍' };
}

function sportIconAsset(name?: string) {
  const value = (name ?? '').toLowerCase();
  if (value.includes('football') || value.includes('soccer')) return '/icons/3d/football-3d.svg';
  if (value.includes('basket')) return '/icons/3d/basketball-3d.svg';
  if (value.includes('tennis')) return '/icons/3d/tennis-3d.svg';
  if (value.includes('hockey')) return '/icons/3d/hockey-3d.svg';
  if (value.includes('esport')) return '/icons/3d/esports-3d.svg';
  return '/icons/3d/sport-3d.svg';
}

export default function MarketsPage() {
  const [sportId, setSportId] = useState<string | undefined>(undefined);
  const [leagueFilter, setLeagueFilter] = useState<string | undefined>(undefined);
  const [countryFilter, setCountryFilter] = useState<string | undefined>(undefined);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
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
    if (leagueFilter) {
      list = list.filter((g) => {
        const league = (g as { league?: { name?: string } }).league?.name ?? '';
        return league === leagueFilter;
      });
    }
    if (countryFilter) {
      list = list.filter((g) => {
        const league = (g as { league?: { name?: string } }).league?.name ?? '';
        return extractCountryAndLeague(league).country === countryFilter;
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
  }, [games, q, timeFilter, leagueFilter, countryFilter]);

  const countryLeagueGroups = useMemo(() => {
    if (!games) return [];
    const groups = new Map<string, { country: string; flag: string; leagues: Map<string, { league: string; count: number; sport: string }> }>();
    for (const game of games) {
      const leagueName = (game as { league?: { name?: string } }).league?.name ?? '';
      if (!leagueName) continue;
      const sportName = (game as { sport?: { name?: string } }).sport?.name ?? 'Sport';
      const parsed = extractCountryAndLeague(leagueName);
      if (!groups.has(parsed.country)) {
        groups.set(parsed.country, {
          country: parsed.country,
          flag: parsed.flag,
          leagues: new Map(),
        });
      }
      const group = groups.get(parsed.country)!;
      const entry = group.leagues.get(leagueName);
      group.leagues.set(leagueName, {
        league: leagueName,
        count: (entry?.count ?? 0) + 1,
        sport: sportName,
      });
    }
    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        leagues: Array.from(group.leagues.values()).sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.leagues.length - a.leagues.length)
      .slice(0, 12);
  }, [games]);

  const activeSportName = useMemo(() => {
    const active = sports.find((s) => (s as { id?: string }).id === sportId) as { name?: string } | undefined;
    return active?.name ?? 'Sport';
  }, [sports, sportId]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <aside className="lg:w-64 shrink-0 rounded-2xl border border-border/80 bg-card/60 p-2.5 sm:p-3 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Link href="/live">
              <Button variant="ghost" size="sm" className="h-10 gap-2 w-full justify-start border border-border/60 bg-background/40">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent" />
                </span>
                Live
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-10 gap-2 flex-1 justify-start border border-border/60 bg-background/40" disabled>
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
                'h-10 w-full justify-between font-normal border border-transparent hover:border-border/70',
                sportId === undefined && 'bg-muted border-border/70'
              )}
              onClick={() => {
                setSportId(undefined);
                setLeagueFilter(undefined);
                setCountryFilter(undefined);
              }}
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
                    'h-10 w-full justify-between font-normal border border-transparent hover:border-border/70',
                    sportId === s?.id && 'bg-muted border-border/70'
                  )}
                  onClick={() => {
                    setSportId(s?.id ?? undefined);
                    setLeagueFilter(undefined);
                    setCountryFilter(undefined);
                    setExpandedCountries({});
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Image
                      src={sportIconAsset(s?.name)}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                    />
                    <span>{s?.name ?? s?.id}</span>
                  </span>
                  {s?.activeGamesCount != null && (
                    <span className="text-muted-foreground text-xs">{s.activeGamesCount}</span>
                  )}
                </Button>
              );
            })}
          </nav>
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground px-2 py-1">
              {sportId ? `${activeSportName} Countries & Leagues` : 'Countries & Leagues'}
            </p>
            {countryLeagueGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2">No league data available.</p>
            ) : (
              countryLeagueGroups.map((group) => (
                <div key={group.country} className="rounded-md border border-border/50 bg-background/30 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'mb-1 h-8 w-full justify-between px-1.5 text-xs',
                      countryFilter === group.country && 'text-primary'
                    )}
                    onClick={() => {
                      setCountryFilter((prev) => (prev === group.country ? undefined : group.country));
                      setExpandedCountries((prev) => ({
                        ...prev,
                        [group.country]: !prev[group.country],
                      }));
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span>{group.flag}</span>
                      <span>{group.country}</span>
                      <span className="text-[10px] text-muted-foreground">({group.leagues.length})</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-muted-foreground transition-transform',
                        expandedCountries[group.country] && 'rotate-180'
                      )}
                    />
                  </Button>
                  {expandedCountries[group.country] && (
                    <div className="flex flex-wrap gap-1.5">
                      {group.leagues.slice(0, 8).map((leagueItem) => (
                        <Button
                          key={leagueItem.league}
                          variant={leagueFilter === leagueItem.league ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() =>
                            setLeagueFilter((prev) => (prev === leagueItem.league ? undefined : leagueItem.league))
                          }
                          title={`${leagueItem.league} (${leagueItem.sport})`}
                        >
                          {leagueItem.league}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
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
            className="h-11 pl-9"
            aria-label="Search markets"
          />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card/50 p-3.5 sm:p-4">
          <Image
            src="/logo.png"
            alt=""
            width={900}
            height={280}
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-auto opacity-10"
          />
          <h1 className="text-2xl font-bold">Sports Markets</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            <strong>{APP_CONFIG.promoHeadline}.</strong>
            <br />
            {APP_CONFIG.promoSecondary}.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIME_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={timeFilter === f.value ? 'secondary' : 'outline'}
                size="sm"
                className="h-9 min-w-[54px]"
                onClick={() => setTimeFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <section className="overflow-hidden rounded-xl border border-border/70 bg-background/35">
          <div className="marquee-track py-3 text-sm font-medium text-muted-foreground">
            {[...Array(2)].map((_, loop) => (
              <div key={loop} className="inline-flex items-center gap-3 px-4">
                <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-primary">What is Azuro?</span>
                <span>Azuro powers fully on-chain sportsbook liquidity and settlement.</span>
                <span className="h-1 w-1 rounded-full bg-primary/70" />
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">What is GIBISBIG?</span>
                <span>AI-agent ready sports betting with self-cashout control.</span>
                <span className="h-1 w-1 rounded-full bg-accent/70" />
                <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-0.5 text-purple-300">
                  Hot odds & live events ({APP_CONFIG.promoCampaignId})
                </span>
                <span>Track live clashes, compare prices, and cash out instantly.</span>
                <span className="h-1 w-1 rounded-full bg-purple-400/70" />
              </div>
            ))}
          </div>
        </section>
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-3 sm:p-4">
          <Image
            src="/logo.png"
            alt=""
            width={1200}
            height={1200}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          />
          <div className="relative grid gap-5 lg:grid-cols-3 lg:gap-8">
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
                    ? `No events on chain ${chainId}. Pick a chain in the header (e.g. Polygon 137, Gnosis 100, or Base 8453) and ensure /api/subgraph returns OK.`
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
    </div>
  );
}
