'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { WalletButton } from '@/components/wallet/wallet-button';
import { ChainSelect } from '@/components/wallet/chain-select';
import { ClientOnly } from '@/components/client-only';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/markets', label: 'Markets' },
  { href: '/live', label: 'Live' },
  { href: '/bets', label: 'Activity' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:min-h-20 sm:gap-4 sm:px-4 sm:py-3 max-w-7xl">
        <Link href="/" className="flex items-center shrink-0 gap-2 sm:gap-4" aria-label="Gibisbig home">
          <Image
            src="/logo.png"
            alt="Gibisbig"
            width={640}
            height={160}
            className="h-12 w-auto max-h-16 object-contain object-left sm:h-16 md:h-28"
            priority
          />
          <div className="hidden md:flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <span aria-hidden className="text-3xl leading-none">🇳🇬</span>
              Sportsbook
            </span>
            <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
              Powered by Azuro
              <span className="inline-flex h-5 w-20 items-center justify-center rounded border border-dashed border-border/80 bg-background/40">
                <Image src="/azuro.png" alt="Azuro" width={72} height={18} className="h-3.5 w-auto object-contain" />
              </span>
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-5" role="navigation" aria-label="Main">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-white',
                  pathname === href && 'text-primary'
                )}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 min-h-9">
          <ClientOnly
            placeholder={
              <>
                <div className="h-9 w-[140px] rounded-md bg-muted animate-pulse" aria-hidden />
                <div className="h-9 w-24 rounded-md bg-muted animate-pulse" aria-hidden />
              </>
            }
          >
            <ChainSelect />
            <WalletButton />
          </ClientOnly>
        </div>
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-11 w-11 rounded-full bg-card/60">
              <Menu className="h-5 w-5" aria-hidden />
              <span className="sr-only">Open mobile menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            showClose={false}
            className="left-auto top-0 h-screen w-[90vw] max-w-[380px] translate-x-0 translate-y-0 rounded-none border-l border-border bg-background p-0 data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full"
          >
            <DialogTitle className="sr-only">Mobile navigation</DialogTitle>
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Sportsbook Menu</p>
              </div>
              <nav className="flex flex-col gap-2 px-5 py-5" aria-label="Mobile">
                {nav.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                    <span
                      className={cn(
                        'flex h-11 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:bg-card/70 hover:text-white',
                        pathname === href && 'bg-primary/15 text-primary'
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-border px-5 py-5 pb-7">
                <ClientOnly
                  placeholder={
                    <div className="space-y-2">
                      <div className="h-10 w-full rounded-md bg-muted animate-pulse" aria-hidden />
                      <div className="h-10 w-full rounded-md bg-muted animate-pulse" aria-hidden />
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <ChainSelect className="w-full justify-between text-sm font-semibold uppercase tracking-wide" />
                    <WalletButton className="w-full text-sm font-semibold uppercase tracking-wide" />
                  </div>
                </ClientOnly>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
