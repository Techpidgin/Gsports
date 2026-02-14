import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inconsolata, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/providers';
import { Header } from '@/components/layout/header';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-inconsolata',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Gibisbig | Decentralized Betting on Azuro',
  description: 'Bet on sports and prediction markets across Gnosis, Polygon, Chiliz, and Base with EVM wallets.',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${inconsolata.variable}`}
      >
        <Providers>
          <Header />
          <main className="container mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-4 sm:py-6 sm:pb-6">{children}</main>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
