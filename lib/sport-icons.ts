const SPORTS_ICONS_BASE = '/icons/sports';

export function sportIconAsset(name?: string): string {
  const value = (name ?? '').toLowerCase();
  if (value.includes('soccer') || (value.includes('football') && !value.includes('american'))) return `${SPORTS_ICONS_BASE}/football.svg`;
  if (value.includes('basket')) return `${SPORTS_ICONS_BASE}/basketball.svg`;
  if (value.includes('tennis') && !value.includes('table')) return `${SPORTS_ICONS_BASE}/tennis.svg`;
  if (value.includes('hockey')) return `${SPORTS_ICONS_BASE}/hockey.svg`;
  if (value.includes('esport') || value.includes('e-sport') || value.includes('e sport')) return `${SPORTS_ICONS_BASE}/esports.svg`;
  if (value.includes('volleyball')) return `${SPORTS_ICONS_BASE}/volleyball.svg`;
  if (value.includes('cricket')) return `${SPORTS_ICONS_BASE}/cricket.svg`;
  if (value.includes('baseball')) return `${SPORTS_ICONS_BASE}/baseball.svg`;
  if (value.includes('boxing') || value.includes('mma') || value.includes('ufc')) return `${SPORTS_ICONS_BASE}/boxing.svg`;
  if (value.includes('rugby')) return `${SPORTS_ICONS_BASE}/rugby.svg`;
  if (value.includes('table tennis') || value.includes('ping pong') || value.includes('ping-pong')) return `${SPORTS_ICONS_BASE}/table-tennis.svg`;
  if (value.includes('darts')) return `${SPORTS_ICONS_BASE}/darts.svg`;
  if (value.includes('cycl')) return `${SPORTS_ICONS_BASE}/cycling.svg`;
  if (value.includes('motor') || value.includes('formula') || value.includes('f1') || value.includes('racing')) return `${SPORTS_ICONS_BASE}/motorsport.svg`;
  if (value.includes('american football')) return `${SPORTS_ICONS_BASE}/american-football.svg`;
  if (value.includes('snooker') || value.includes('billiard') || value.includes('pool')) return `${SPORTS_ICONS_BASE}/snooker.svg`;
  if (value.includes('handball')) return `${SPORTS_ICONS_BASE}/handball.svg`;
  return `${SPORTS_ICONS_BASE}/sport.svg`;
}
