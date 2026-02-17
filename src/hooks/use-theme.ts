import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  localStorage.setItem('app-theme', theme);
  listeners.forEach(cb => cb());
}

// Initialize on load
const stored = localStorage.getItem('app-theme');
if (stored === 'light' || stored === 'dark') {
  setTheme(stored);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  return { theme, toggleTheme };
}
