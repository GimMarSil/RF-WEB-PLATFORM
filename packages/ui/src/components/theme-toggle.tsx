import React from 'react';
import { usePrefs } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  const themes: Record<string, string> = {
    light: 'dark',
    dark: 'high-contrast',
    'high-contrast': 'light'
  };
  const next = themes[theme];
  return (
    <button
      onClick={() => setTheme(next as any)}
      aria-label="Toggle theme"
      className="p-2 border rounded"
    >
      {theme}
    </button>
  );
}
