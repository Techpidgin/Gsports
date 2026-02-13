'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true only after the component has mounted (client).
 * Server and first client render both get false, so hydration matches.
 * Use for query enabled flags that must run only on the client.
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}
