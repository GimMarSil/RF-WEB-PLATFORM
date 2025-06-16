import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';

interface PrefContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: string;
  setLanguage: (l: string) => void;
}

const PrefContext = createContext<PrefContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState('pt');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user-prefs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<PrefContextValue>;
        if (parsed.theme) setThemeState(parsed.theme as Theme);
        if (parsed.language) setLanguageState(parsed.language);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('light', 'dark', 'high-contrast');
    document.documentElement.classList.add(theme);
    document.documentElement.lang = language;
    localStorage.setItem('user-prefs', JSON.stringify({ theme, language }));
  }, [theme, language]);

  return (
    <PrefContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        language,
        setLanguage: setLanguageState
      }}
    >
      {children}
    </PrefContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefContext);
  if (!ctx) throw new Error('usePrefs must be used within ThemeProvider');
  return ctx;
}
