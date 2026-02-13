import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/">Home / Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/markets">Markets</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/live">Live</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bets">Activity</Link>
        </Button>
      </div>
    </div>
  );
}
