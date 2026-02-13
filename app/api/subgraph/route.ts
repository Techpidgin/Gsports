import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** GET: health check so you can verify the proxy is reachable (e.g. open /api/subgraph in a tab). */
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Subgraph proxy ready' });
}

/**
 * Proxies GraphQL requests to Azuro subgraph URLs to avoid CORS in the browser.
 * POST body: { url: string, query: string, variables?: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, query, variables } = body as { url?: string; query?: string; variables?: object };

    if (!url || typeof url !== 'string' || !query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid url or query' },
        { status: 400 }
      );
    }

    const allowedHosts = [
      'thegraph-1.onchainfeed.org',
      'thegraph.onchainfeed.org',
      'thegraph.azuro.org',
    ];
    const parsed = new URL(url);
    if (!allowedHosts.some((h) => parsed.hostname === h)) {
      return NextResponse.json(
        { error: 'Subgraph URL not allowed' },
        { status: 403 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let res: Response;
    try {
      res = await fetch(`${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/graphql-response+json',
        },
        body: JSON.stringify({ query, variables: variables ?? {} }),
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      let msg = 'Subgraph unreachable';
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') msg = 'Subgraph request timed out';
        else {
          const cause = (fetchError as Error & { cause?: { code?: string } }).cause;
          const code = cause?.code;
          msg = code ? `${fetchError.message} (${code})` : fetchError.message;
        }
      }
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    clearTimeout(timeoutId);

    const text = await res.text();
    if (!res.ok) {
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
      });
    }

    let data: { data?: unknown; errors?: unknown[] };
    try {
      data = JSON.parse(text);
    } catch {
      return new NextResponse(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('[subgraph proxy]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Proxy error' },
      { status: 500 }
    );
  }
}
