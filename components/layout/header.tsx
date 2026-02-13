'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Zap, History } from 'lucide-react';
import { WalletButton } from '@/components/wallet/wallet-button';
import { ChainSelect } from '@/components/wallet/chain-select';
import { ClientOnly } from '@/components/client-only';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: Trophy },
  { href: '/live', label: 'Live', icon: Zap },
  { href: '/bets', label: 'Activity', icon: History },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-4 px-4 py-3 max-w-7xl">
        <Link href="/" className="flex items-center shrink-0 gap-3" aria-label="Gibisbig home">
          <Image
            src="/logo.png"
            alt="Gibisbig"
            width={640}
            height={160}
            className="h-12 w-auto max-h-16 object-contain object-left"
            priority
          />
          <span className="hidden lg:inline-flex rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Sportsbook
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? 'secondary' : 'ghost'}
                size="sm"
                className={cn('gap-2', pathname === href && 'bg-primary/20 text-primary border border-primary/35')}
                aria-current={pathname === href ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 min-h-9">
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
      </div>

      <nav
        className="flex md:hidden gap-2 overflow-x-auto px-4 pb-2 border-t border-border pt-2"
        aria-label="Mobile"
      >
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('shrink-0 gap-1', pathname === href && 'bg-primary/20 text-primary border border-primary/35')}
              aria-current={pathname === href ? 'page' : undefined}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
}
