import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Azuro odds use 12 decimals in subgraph; raw value / 10^12 = decimal (e.g. 1.85) */
const ODDS_DECIMALS = 12;

export function parseOdds(raw: string | number | null | undefined): number {
  if (raw == null) return 0;
  const n = typeof raw === 'string' ? Number(raw) : raw;
  if (Number.isNaN(n)) return 0;
  if (n >= 1000) return n / 10 ** ODDS_DECIMALS;
  return n;
}

export function formatOdds(odds: number): string {
  return odds > 0 ? odds.toFixed(2) : '—';
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const value = Number(amount) / 10 ** decimals;
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
