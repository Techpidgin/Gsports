'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_CONFIG, ZERO_ADDRESS } from '@/lib/app-config';
import { ShieldAlert, Gift, ExternalLink } from 'lucide-react';

const AUTHORIZED_FREEBET_ADMIN = '0x9309075550F1c52ADfc2511F61B9AD11568A28f6'.toLowerCase();

function isAuthorized(address: string | undefined): boolean {
  if (!address) return false;
  const a = address.toLowerCase();
  const owner = APP_CONFIG.ownerAddress !== ZERO_ADDRESS ? APP_CONFIG.ownerAddress.toLowerCase() : '';
  return a === AUTHORIZED_FREEBET_ADMIN || a === owner;
}

export default function OwnerPage() {
  const { address, isConnected } = useAccount();
  const allowed = isAuthorized(address);

  if (!isConnected || !address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Owner dashboard</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Connect your EVM wallet to access this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Owner dashboard</h1>
        <Card className="border-destructive/50">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive" aria-hidden />
            <p className="text-muted-foreground">You are not authorized to view this page.</p>
            <p className="text-sm text-muted-foreground">Only the contract owner or authorized freebet admin can access the owner dashboard.</p>
            <Button variant="outline" asChild>
              <Link href="/">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Owner dashboard</h1>
        <span className="text-xs text-muted-foreground rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
          Authorized
        </span>
      </div>
      <p className="text-muted-foreground">
        Manage freebets and view issuer tools. Only you and the authorized admin can see this page.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Freebets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View and manage freebets. Users see their available freebets on the public Freebets page; you can issue or authorize freebets via the Azuro protocol (affiliate/backend).
            </p>
            <Button asChild>
              <Link href="/freebets" className="inline-flex items-center gap-2">
                Open Freebets page
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Issue / Authorize</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Freebet issuance is handled by the Azuro protocol and your affiliate configuration. Use your affiliate address and Azuro docs to grant freebets to users. This app uses affiliate: <code className="text-[11px] bg-muted px-1 rounded">{APP_CONFIG.affiliateAddress}</code>
            </p>
            <Button variant="outline" asChild>
              <a href="https://docs.azuro.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                Azuro docs
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authorized addresses</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-1 text-muted-foreground">
            {APP_CONFIG.ownerAddress !== ZERO_ADDRESS && (
              <li>Owner: <code className="text-foreground">{APP_CONFIG.ownerAddress}</code></li>
            )}
            <li>Freebet admin: <code className="text-foreground">{AUTHORIZED_FREEBET_ADMIN}</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
