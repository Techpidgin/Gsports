'use client';

import { useConditions } from '@azuro-org/sdk';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatOdds, parseOdds } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getOutcomeDisplayLabel, getConditionMarketName, isFullTimeResultStyle } from '@/lib/outcome-labels';
import { sportIconAsset } from '@/lib/sport-icons';

type Game = {
  id: string;
  title?: string | null;
  participants?: Array<{ name?: string; image?: string | null } | null> | null;
  league?: { name?: string } | null;
  sport?: { name?: string } | null;
  startsAt?: string | null;
};

/** Key per selection so same outcomeId in different games don't cross-highlight */
export function selectionKey(conditionId: string, outcomeId: string) {
  return `${conditionId}-${outcomeId}`;
}

type MarketCardProps = {
  game: Game;
  onAddSelection: (item: { outcomeId: string; conditionId: string; gameId: string; isExpressForbidden: boolean }) => void;
  onRemoveSelection: (selection: { outcomeId: string; conditionId: string }) => void;
  /** Set of selection keys (conditionId-outcomeId) so only the exact pick is highlighted */
  selectedSelectionKeys: Set<string>;
};

function TeamBadge({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image src="/logo.png" alt="" fill className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-black/45" />
      </div>
    );
  }

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
      <Image src={src} alt={alt} fill className="object-cover" sizes="32px" unoptimized onError={() => setFailed(true)} />
    </div>
  );
}

function ClashPanel({ src, side }: { src?: string | null; side: 'left' | 'right' }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className="relative">
      {showFallback ? (
        <div className="relative h-full w-full bg-primary/20">
          <Image src="/logo.png" alt="" fill className="object-cover opacity-20" />
        </div>
      ) : (
        <Image src={src} alt="" fill className="object-cover" unoptimized onError={() => setFailed(true)} />
      )}
      <div className={cn('absolute inset-0', side === 'left' ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent' : 'bg-gradient-to-l from-black/70 via-black/30 to-transparent')} />
    </div>
  );
}

export function MarketCard({ game, onAddSelection, onRemoveSelection, selectedSelectionKeys }: MarketCardProps) {
  const { data: conditions, isLoading: conditionsLoading } = useConditions({ gameId: game.id });
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const participants = game.participants ?? [];
  const home = participants[0]?.name ?? 'TBD';
  const away = participants[1]?.name ?? 'TBD';
  const homeImage = participants[0]?.image;
  const awayImage = participants[1]?.image;
  const eventTitle = game.title ?? `${home} vs ${away}`;
  const sportName = game.sport?.name ?? 'Sport';
  const leagueName = game.league?.name ?? '';
  const startTime = game.startsAt ? new Date(Number(game.startsAt) * 1000) : null;
  const visibleConditions = conditions?.slice(0, 2) ?? [];
  const extraConditions = conditions?.slice(2) ?? [];
  const hasMoreOptions = extraConditions.length > 0;

  return (
    <div className="h-full">
      <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card/80 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="relative h-16 overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 grid grid-cols-2">
            <ClashPanel src={homeImage} side="left" />
            <ClashPanel src={awayImage} side="right" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-primary/60 bg-black/70 px-3 py-0.5 text-[10px] font-semibold tracking-[0.22em] text-primary">
              CLASH
            </span>
          </div>
        </div>
        <CardHeader className="min-h-[126px] pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Image src={sportIconAsset(sportName)} alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0 opacity-80" />
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
              <TeamBadge src={homeImage} alt={home} />
              <span className="truncate font-medium">{home}</span>
            </div>
            <span className="shrink-0 text-muted-foreground text-sm">vs</span>
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className="truncate font-medium text-right">{away}</span>
              <TeamBadge src={awayImage} alt={away} />
            </div>
          </div>
          <h3 className="sr-only">{eventTitle}</h3>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          {conditionsLoading ? (
            <Skeleton className="h-20 w-full rounded-md" />
          ) : (
            <div className="space-y-3">
              {visibleConditions.map((condition) => {
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
                            const isSelected = selectedSelectionKeys.has(selectionKey(condition.id, outcome.outcomeId));
                            const selection = { outcomeId: outcome.outcomeId, conditionId: condition.id };
                            return (
                              <Button
                                key={outcome.outcomeId}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                  'flex h-12 flex-col gap-0.5 px-1',
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
                      <div className="grid grid-cols-2 gap-2">
                        {outcomes.map((outcome, idx) => {
                          const rawOdds = (outcome as { odds?: string | number })?.odds;
                          const value = parseOdds(rawOdds);
                          const isSelected = selectedSelectionKeys.has(selectionKey(condition.id, outcome.outcomeId));
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
                                'h-11 w-full justify-between border-border/70 bg-background/50 px-2 tabular-nums hover:border-primary/55',
                                isSelected && 'ring-2 ring-primary-foreground/20'
                              )}
                              onClick={() => (isSelected ? onRemoveSelection(selection) : onAddSelection({ ...selection, gameId: game.id, isExpressForbidden: false }))}
                              aria-pressed={isSelected}
                              aria-label={`${displayLabel} ${formatOdds(value)}`}
                            >
                              <span className="truncate text-xs">{displayLabel}</span>
                              <span className="ml-1.5 font-semibold">{formatOdds(value)}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {hasMoreOptions && (
                <Dialog open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full border-border/70 bg-background/50 text-xs uppercase tracking-wide hover:border-primary/55"
                    onClick={() => setShowMoreOptions(true)}
                  >
                    More options ({extraConditions.length})
                  </Button>
                  <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{home} vs {away}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
                      {extraConditions.map((condition) => {
                        const outcomes = condition.outcomes ?? [];
                        const firstOutcomeId = outcomes[0] ? String(outcomes[0].outcomeId) : '';
                        const marketName = getConditionMarketName(firstOutcomeId);
                        const show1X2 = isFullTimeResultStyle(outcomes.length, marketName);

                        return (
                          <div key={condition.id} className="space-y-1.5 rounded-md border border-border/60 bg-background/30 p-2">
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
                                    const isSelected = selectedSelectionKeys.has(selectionKey(condition.id, outcome.outcomeId));
                                    const selection = { outcomeId: outcome.outcomeId, conditionId: condition.id };
                                    return (
                                      <Button
                                        key={outcome.outcomeId}
                                        variant={isSelected ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                          'flex h-12 flex-col gap-0.5 px-1',
                                          isSelected && 'ring-2 ring-primary-foreground/20'
                                        )}
                                        onClick={() =>
                                          isSelected
                                            ? onRemoveSelection(selection)
                                            : onAddSelection({ ...selection, gameId: game.id, isExpressForbidden: false })
                                        }
                                        aria-pressed={isSelected}
                                        aria-label={`${label} ${formatOdds(value)}`}
                                      >
                                        <span className="text-sm font-semibold">{label}</span>
                                        <span className="text-xs tabular-nums opacity-90">{formatOdds(value)}</span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {outcomes.map((outcome, idx) => {
                                  const rawOdds = (outcome as { odds?: string | number })?.odds;
                                  const value = parseOdds(rawOdds);
                                  const isSelected = selectedSelectionKeys.has(selectionKey(condition.id, outcome.outcomeId));
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
                                        'h-11 w-full justify-between border-border/70 bg-background/50 px-2 tabular-nums hover:border-primary/55',
                                        isSelected && 'ring-2 ring-primary-foreground/20'
                                      )}
                                      onClick={() => (isSelected ? onRemoveSelection(selection) : onAddSelection({ ...selection, gameId: game.id, isExpressForbidden: false }))}
                                      aria-pressed={isSelected}
                                      aria-label={`${displayLabel} ${formatOdds(value)}`}
                                    >
                                      <span className="truncate text-xs">{displayLabel}</span>
                                      <span className="ml-1.5 font-semibold">{formatOdds(value)}</span>
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
