import React from 'react';
import { usePrefs, type Theme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  const themes: Record<Theme, Theme> = {
    light: 'dark',
    dark: 'high-contrast',
    'high-contrast': 'light'
  };
  const next = themes[theme];
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
      className="p-2 border rounded"
    >
      {theme}
    </button>
  );
}
