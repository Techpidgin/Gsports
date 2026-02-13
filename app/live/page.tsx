'use client';

import { useGames, useBaseBetslip, useChain } from '@azuro-org/sdk';
import { Card, CardContent } from '@/components/ui/card';
import { MarketCard } from '@/components/market/market-card';
import { BetSlip } from '@/components/betslip/bet-slip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsClient } from '@/lib/use-is-client';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';

export default function LivePage() {
  const isClient = useIsClient();
  const chain = useChain();
  const chainId = chain?.appChain?.id ?? DEFAULT_CHAIN_ID;
  const { data: games, isLoading, isSuccess, isError, refetch } = useGames({
    chainId,
    filter: { limit: 24 },
    isLive: true,
    query: { enabled: isClient },
  });
  const { items, addItem, removeItem } = useBaseBetslip();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live</h1>
      <p className="text-muted-foreground">Live in-play markets. Odds update in real time.</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {games?.map((game) => (
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
                <p className="text-muted-foreground mb-4">Couldn&apos;t load live markets. Try switching chain or refresh.</p>
                <Button variant="outline" onClick={() => refetch()}>Retry</Button>
              </CardContent>
            </Card>
          )}
          {!isLoading && isSuccess && (!games || games.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No live events right now. Check back later or switch chain.
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
