'use client';

import { useConditions } from '@azuro-org/sdk';
import { formatOdds, parseOdds } from '@/lib/utils';
import { getConditionMarketName, isFullTimeResultStyle } from '@/lib/outcome-labels';

export function LiveGameOdds({ gameId }: { gameId: string }) {
  const { data: conditions } = useConditions({ gameId });
  const first = conditions?.[0];
  const outcomes = first?.outcomes ?? [];
  const firstOutcomeId = outcomes[0] ? String(outcomes[0].outcomeId) : '';
  const marketName = getConditionMarketName(firstOutcomeId);
  const show1X2 = isFullTimeResultStyle(outcomes.length, marketName);

  if (outcomes.length === 0) return <span className="text-[10px] text-muted-foreground">—</span>;
  if (show1X2 && outcomes.length === 3) {
    const vals = (['1', 'X', '2'] as const).map((_, i) => formatOdds(parseOdds((outcomes[i] as { odds?: string | number })?.odds)));
    return (
      <span className="tabular-nums text-[10px] font-medium text-muted-foreground">
        {vals[0]} · {vals[1]} · {vals[2]}
      </span>
    );
  }
  const v = formatOdds(parseOdds((outcomes[0] as { odds?: string | number })?.odds));
  return <span className="tabular-nums text-[10px] font-medium text-muted-foreground">{v}</span>;
}
