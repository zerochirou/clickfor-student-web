'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isMounted) {
    return <div className="h-9 w-9" />;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
    >
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 transform dark:-rotate-90 dark:scale-0 rotate-0 scale-100">
        <Sun size={18} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 transform rotate-90 scale-0 dark:rotate-0 dark:scale-100">
        <Moon size={18} />
      </div>
    </button>
  );
}
