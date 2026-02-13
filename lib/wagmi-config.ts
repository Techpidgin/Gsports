'use client';

import { http, createConfig } from 'wagmi';
import { gnosis, polygon, polygonAmoy, base, baseSepolia } from 'wagmi/chains';
import { SUPPORTED_CHAIN_IDS } from './azuro-chains';

// Chiliz chains are not in wagmi/chains; define minimal config for connector compatibility.
// Azuro SDK/toolkit use their own chain data from @azuro-org/toolkit (chainsData).
const chiliz = {
  id: 88888,
  name: 'Chiliz',
  nativeCurrency: { name: 'CHZ', symbol: 'CHZ', decimals: 18 },
  rpcUrls: { default: { http: ['https://chiliz-rpc.publicnode.com'] } },
  blockExplorers: { default: { name: 'Chiliz Explorer', url: 'https://chiliz-explorer.fuse.io' } },
} as const;

const chilizSpicy = {
  id: 88882,
  name: 'Chiliz Spicy',
  nativeCurrency: { name: 'CHZ', symbol: 'CHZ', decimals: 18 },
  rpcUrls: { default: { http: ['https://spicy-rpc.chiliz.com'] } },
  blockExplorers: { default: { name: 'Chiliz Spicy Explorer', url: 'https://spicy-explorer.chiliz.com' } },
} as const;

const chains = [gnosis, polygon, polygonAmoy, chiliz, chilizSpicy, base, baseSepolia] as const;

function getChainRpc(chainId: number): string {
  const c = chains.find((ch) => ch.id === chainId);
  if (!c?.rpcUrls?.default?.http?.[0]) return '';
  return c.rpcUrls.default.http[0];
}

export const wagmiConfig = createConfig({
  chains,
  transports: chains.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.id]: http(getChainRpc(chain.id)),
    }),
    {} as Record<number, ReturnType<typeof http>>
  ),
});

export { chains };
export const isSupportedChain = (chainId: number) => SUPPORTED_CHAIN_IDS.includes(chainId);
