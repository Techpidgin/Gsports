/**
 * Geo-blocking config (case study: Bookmaker.XYZ).
 * @see https://bookmakerxyz.app/geo
 * Access from these countries is prohibited; users are redirected to /geo.
 */
export const GEO_BLOCKED_COUNTRY_CODES = ['US', 'RU', 'CN', 'TR'] as const;

export const GEO_BLOCKED_COUNTRY_NAMES: Record<string, string> = {
  US: 'USA',
  RU: 'Russian Federation',
  CN: 'China',
  TR: 'Turkey',
};

/** Human-readable list for the /geo page. */
export const GEO_BLOCKED_LIST = GEO_BLOCKED_COUNTRY_CODES.map(
  (code) => GEO_BLOCKED_COUNTRY_NAMES[code] ?? code
).join(', ');

export function isCountryBlocked(countryCode: string | null | undefined): boolean {
  if (!countryCode || typeof countryCode !== 'string') return false;
  return GEO_BLOCKED_COUNTRY_CODES.includes(countryCode.toUpperCase() as (typeof GEO_BLOCKED_COUNTRY_CODES)[number]);
}
