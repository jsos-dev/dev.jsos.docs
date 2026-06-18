'use client';
import { useEffect } from 'react';

function applyTheme(theme: string) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeSync() {
  useEffect(() => {
    if (!window.JSOS) return;

    window.JSOS.getTheme().then(applyTheme);
    return window.JSOS.onThemeChange(applyTheme);
  }, []);

  return null;
}
