/**
 * Map outcome to bookmaker-style labels: 1 (home win), X (draw), 2 (away win) for Full Time Result.
 * For 3-outcome match result markets we always use index: 0=1, 1=X, 2=2 so users never see raw numbers.
 */

const ONE_X_TWO = ['1', 'X', '2'] as const;

function normalizeTo1X2(_label: string, outcomeIndex: number, totalOutcomes: number): string {
  if (totalOutcomes === 3 && outcomeIndex >= 0 && outcomeIndex <= 2) return ONE_X_TWO[outcomeIndex];
  return ONE_X_TWO[outcomeIndex] ?? _label;
}

function getMarketNameFromOutcome(outcomeId: string): string | null {
  try {
    const { getMarketName } = require('@azuro-org/dictionaries');
    const numId = Number(outcomeId);
    if (Number.isNaN(numId)) return null;
    return getMarketName({ outcomeId: numId }) ?? null;
  } catch {
    return null;
  }
}

export function getOutcomeDisplayLabel(options: {
  outcomeId: string;
  title?: string | null;
  outcomeIndex: number;
  totalOutcomes: number;
  marketName?: string | null;
}): string {
  const { outcomeId, title, outcomeIndex, totalOutcomes, marketName } = options;
  let label = (title ?? String(outcomeId)).trim();
  try {
    const { getSelectionName } = require('@azuro-org/dictionaries');
    const numId = Number(outcomeId);
    if (!Number.isNaN(numId)) {
      const dictLabel = getSelectionName({ outcomeId: numId });
      if (dictLabel) label = dictLabel;
    }
  } catch {
    //
  }
  const is1X2 =
    totalOutcomes === 3 &&
    (marketName == null ||
      /full time result|match winner|1x2|result|winner/i.test(marketName));
  return is1X2 ? normalizeTo1X2(label, outcomeIndex, totalOutcomes) : label;
}

export function getConditionMarketName(firstOutcomeId: string): string | null {
  return getMarketNameFromOutcome(firstOutcomeId);
}

export function isFullTimeResultStyle(totalOutcomes: number, marketName?: string | null): boolean {
  if (totalOutcomes !== 3) return false;
  const name = (marketName ?? '').toLowerCase();
  return (
    name.includes('full time result') ||
    name.includes('match winner') ||
    name.includes('1x2') ||
    name.includes('result') ||
    name.includes('winner') ||
    !marketName
  );
}
