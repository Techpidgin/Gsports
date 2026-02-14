'use client';

import Link from 'next/link';
import { APP_CONFIG, ZERO_ADDRESS } from '@/lib/app-config';
import { shortenAddress } from '@/lib/utils';

const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || 'https://t.me/+f_RvvwXltxJlYjVk';
const TWITTER_X_URL = process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || 'https://x.com/GIBISBIG';

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/60 mt-auto">
      <div className="container mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">GIBISBIG</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Decentralized sports and prediction market powered by Azuro. Markets run on EVM chains only: Polygon, Gnosis, Chiliz, Base.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your EVM wallet (MetaMask, etc.) and pick a chain in the header to see games across Azuro-supported networks.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Community</p>
            <div className="flex gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Telegram
              </a>
              <a
                href={TWITTER_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                X (Twitter)
              </a>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Info</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span>Promo: {APP_CONFIG.promoCampaignId}</span>
              {APP_CONFIG.ownerAddress !== ZERO_ADDRESS && (
                <span>Owner: {shortenAddress(APP_CONFIG.ownerAddress, 6)}</span>
              )}
              {APP_CONFIG.treasuryAddress !== ZERO_ADDRESS && (
                <span>Treasury: {shortenAddress(APP_CONFIG.treasuryAddress, 6)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
