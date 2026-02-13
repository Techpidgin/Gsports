'use client';

import { useConditions } from '@azuro-org/sdk';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatOdds, parseOdds } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getOutcomeDisplayLabel, getConditionMarketName, isFullTimeResultStyle } from '@/lib/outcome-labels';

type Game = {
  id: string;
  title?: string | null;
  participants?: Array<{ name?: string; image?: string | null } | null> | null;
  league?: { name?: string } | null;
  sport?: { name?: string } | null;
  startsAt?: string | null;
};

type MarketCardProps = {
  game: Game;
  onAddSelection: (item: { outcomeId: string; conditionId: string; gameId: string; isExpressForbidden: boolean }) => void;
  onRemoveSelection: (selection: { outcomeId: string; conditionId: string }) => void;
  selectedOutcomeIds: string[];
};

export function MarketCard({ game, onAddSelection, onRemoveSelection, selectedOutcomeIds }: MarketCardProps) {
  const { data: conditions, isLoading: conditionsLoading } = useConditions({ gameId: game.id });

  const participants = game.participants ?? [];
  const home = participants[0]?.name ?? 'TBD';
  const away = participants[1]?.name ?? 'TBD';
  const homeImage = participants[0]?.image;
  const awayImage = participants[1]?.image;
  const eventTitle = game.title ?? `${home} vs ${away}`;
  const sportName = game.sport?.name ?? 'Sport';
  const leagueName = game.league?.name ?? '';
  const startTime = game.startsAt ? new Date(Number(game.startsAt) * 1000) : null;

  return (
    <div>
      <Card className="overflow-hidden border-border/70 bg-card/80 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <CardHeader className="pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {sportName}
            {leagueName && ` · ${leagueName}`}
          </p>
          {startTime && (
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {startTime.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {homeImage ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Image src={homeImage} alt="" fill className="object-cover" sizes="32px" unoptimized />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
              )}
              <span className="truncate font-medium">{home}</span>
            </div>
            <span className="shrink-0 text-muted-foreground text-sm">vs</span>
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className="truncate font-medium text-right">{away}</span>
              {awayImage ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Image src={awayImage} alt="" fill className="object-cover" sizes="32px" unoptimized />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
              )}
            </div>
          </div>
          <h3 className="sr-only">{eventTitle}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {conditionsLoading ? (
            <Skeleton className="h-20 w-full rounded-md" />
          ) : (
            <div className="space-y-3">
              {conditions?.slice(0, 3).map((condition) => {
                const outcomes = condition.outcomes ?? [];
                const firstOutcomeId = outcomes[0] ? String(outcomes[0].outcomeId) : '';
                const marketName = getConditionMarketName(firstOutcomeId);
                const show1X2 = isFullTimeResultStyle(outcomes.length, marketName);

                return (
                  <div key={condition.id} className="space-y-1.5">
                    {marketName && !show1X2 && (
                      <p className="text-xs font-medium text-muted-foreground">{marketName}</p>
                    )}
                    {show1X2 && outcomes.length === 3 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Full Time Result</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['1', 'X', '2'] as const).map((label, idx) => {
                            const outcome = outcomes[idx];
                            if (!outcome) return null;
                            const rawOdds = (outcome as { odds?: string | number })?.odds;
                            const value = parseOdds(rawOdds);
                            const isSelected = selectedOutcomeIds.includes(outcome.outcomeId);
                            const selection = { outcomeId: outcome.outcomeId, conditionId: condition.id };
                            return (
                              <Button
                                key={outcome.outcomeId}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                  'flex h-auto flex-col gap-0.5 py-2',
                                  isSelected && 'ring-2 ring-primary-foreground/20'
                                )}
                                onClick={() =>
                                  isSelected
                                    ? onRemoveSelection(selection)
                                    : onAddSelection({ ...selection, gameId: game.id, isExpressForbidden: false })
                                }
                                aria-pressed={isSelected}
                                aria-label={`${label} ${label === '1' ? 'Home win' : label === 'X' ? 'Draw' : 'Away win'} ${formatOdds(value)}`}
                              >
                                <span className="text-sm font-semibold">{label}</span>
                                <span className="text-xs tabular-nums opacity-90">{formatOdds(value)}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {outcomes.map((outcome, idx) => {
                          const rawOdds = (outcome as { odds?: string | number })?.odds;
                          const value = parseOdds(rawOdds);
                          const isSelected = selectedOutcomeIds.includes(outcome.outcomeId);
                          const selection = { outcomeId: outcome.outcomeId, conditionId: condition.id };
                          const displayLabel = getOutcomeDisplayLabel({
                            outcomeId: String(outcome.outcomeId),
                            title: outcome.title ?? undefined,
                            outcomeIndex: idx,
                            totalOutcomes: outcomes.length,
                            marketName,
                          });
                          return (
                            <Button
                              key={outcome.outcomeId}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              className={cn(
                                'min-w-[5.25rem] border-border/70 bg-background/50 tabular-nums hover:border-primary/55',
                                isSelected && 'ring-2 ring-primary-foreground/20'
                              )}
                              onClick={() => (isSelected ? onRemoveSelection(selection) : onAddSelection({ ...selection, gameId: game.id, isExpressForbidden: false }))}
                              aria-pressed={isSelected}
                              aria-label={`${displayLabel} ${formatOdds(value)}`}
                            >
                              <span className="truncate">{displayLabel}</span>
                              <span className="ml-1.5 font-semibold tabular-nums">{formatOdds(value)}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
