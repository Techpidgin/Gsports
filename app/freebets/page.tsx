'use client';

import { useAvailableFreebets, useBonuses } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTokenAmount } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/app-config';

function toBigIntAmount(v: unknown): bigint | null {
  if (v == null) return null;
  if (typeof v === 'bigint') return v;
  if (typeof v === 'string') {
    try {
      return BigInt(v);
    } catch {
      return null;
    }
  }
  return null;
}

const AFFILIATE = APP_CONFIG.affiliateAddress;

export default function FreebetsPage() {
  const { address } = useAccount();
  const { data: bonuses, isLoading: bonusesLoading } = useBonuses({
    account: address!,
    affiliate: AFFILIATE,
    query: { enabled: Boolean(address) },
  });
  const { data: freebets, isLoading: freebetsLoading } = useAvailableFreebets({
    account: address!,
    affiliate: AFFILIATE,
    selections: [],
    query: { enabled: Boolean(address) },
  });

  const isLoading = bonusesLoading || freebetsLoading;

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Freebets</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to see bonuses and freebets.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Freebets</h1>
      <p className="text-muted-foreground">
        Bonuses and freebets from Azuro. Use them when placing bets (if supported on this chain).
      </p>

      {isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bonuses</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {bonuses?.length ? (
                <ul className="space-y-2">
                  {bonuses.map((b, i) => (
                    <li key={(b as { id?: string }).id ?? i}>
                      {(() => {
                        const amt = toBigIntAmount((b as { amount?: unknown }).amount);
                        return amt != null ? formatTokenAmount(amt, 18) : null;
                      })()} — {(b as { status?: string }).status ?? '—'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No bonuses.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available freebets</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {freebets?.length ? (
                <ul className="space-y-2">
                  {freebets.map((f, i) => (
                    <li key={(f as { id?: string }).id ?? i}>
                      {(() => {
                        const amt = toBigIntAmount((f as { amount?: unknown }).amount);
                        return amt != null ? formatTokenAmount(amt, 18) : null;
                      })()} — expires {(() => {
                        const exp = (f as { expiresAt?: number | string }).expiresAt;
                        return exp != null ? new Date(Number(exp) * 1000).toLocaleDateString() : '—';
                      })()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No available freebets.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
