/**
 * Azuro-supported chain IDs and config.
 * All chains from Azuro docs: Gnosis, Polygon, Chiliz, Base (mainnet + testnets).
 * @see https://gem.azuro.org/hub/blockchains/deployment-addresses
 */

export const AZURO_CHAIN_IDS = {
  Gnosis: 100,
  Polygon: 137,
  PolygonAmoy: 80002,
  Chiliz: 88888,
  ChilizSpicy: 88882,
  Base: 8453,
  BaseSepolia: 84532,
} as const;

export type AzuroChainId = (typeof AZURO_CHAIN_IDS)[keyof typeof AZURO_CHAIN_IDS];

export const AZURO_CHAIN_NAMES: Record<number, string> = {
  [AZURO_CHAIN_IDS.Gnosis]: 'Gnosis',
  [AZURO_CHAIN_IDS.Polygon]: 'Polygon',
  [AZURO_CHAIN_IDS.PolygonAmoy]: 'Polygon Amoy',
  [AZURO_CHAIN_IDS.Chiliz]: 'Chiliz',
  [AZURO_CHAIN_IDS.ChilizSpicy]: 'Chiliz Spicy',
  [AZURO_CHAIN_IDS.Base]: 'Base',
  [AZURO_CHAIN_IDS.BaseSepolia]: 'Base Sepolia',
};

export const DEFAULT_CHAIN_ID = AZURO_CHAIN_IDS.Polygon;

export const SUPPORTED_CHAIN_IDS: number[] = Object.values(AZURO_CHAIN_IDS);
