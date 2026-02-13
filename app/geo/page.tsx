import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GEO_BLOCKED_LIST } from '@/lib/geo';
import { Globe, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Geo zone restriction | GIB SPORTS',
  description: 'Access from your region is restricted.',
};

export default function GeoPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-lg w-full border-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="h-5 w-5" aria-hidden />
            <span className="text-sm font-medium">Geo zone restriction</span>
          </div>
          <CardTitle className="text-xl">Access restricted</CardTitle>
          <CardDescription>
            It seems you are trying to connect to GIB SPORTS from a restricted country.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Access from the following countries is prohibited: <strong>{GEO_BLOCKED_LIST}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            If you think you shouldn&apos;t see this message, contact support (e.g. Telegram or email).
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Contact via Telegram
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
