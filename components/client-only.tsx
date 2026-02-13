'use client';

import * as React from 'react';

/**
 * Renders children only after mount (client) to avoid hydration mismatch.
 * Server and first client paint render placeholder; then children render.
 */
export function ClientOnly({
  children,
  placeholder = null,
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{placeholder}</>;
}
