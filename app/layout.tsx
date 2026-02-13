import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/providers';
import { Header } from '@/components/layout/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gibisbig | Decentralized Betting on Azuro',
  description: 'Bet on sports and prediction markets across Gnosis, Polygon, Chiliz, and Base. Solana & EVM wallets supported.',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
