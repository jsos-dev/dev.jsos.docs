'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/waku';
import { ThemeSync } from '@/components/ThemeSync';

function HashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      window.location.replace(hash.slice(1));
    }
  }, []);
  return null;
}

export function Provider({ children }: { children: ReactNode }) {
  return (
    <>
      <HashRedirect />
      <ThemeSync />
      <RootProvider>{children}</RootProvider>
    </>
  );
}
