'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { AzuroSDKProvider } from '@azuro-org/sdk';
import { wagmiConfig } from '@/lib/wagmi-config';
import { DEFAULT_CHAIN_ID } from '@/lib/azuro-chains';
import { SolanaWalletProvider } from './solana-wallet-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 1000, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AzuroSDKProvider initialChainId={DEFAULT_CHAIN_ID as 100 | 137 | 80002 | 88888 | 88882 | 8453 | 84532}>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </AzuroSDKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
