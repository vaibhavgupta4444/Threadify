'use client';

import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn relative inline-flex h-10 w-10 items-center justify-center rounded-full 
                 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]
                 hover:bg-[hsl(var(--hover))] transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2
                 focus:ring-offset-[hsl(var(--background))]"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <div className="relative text-[hsl(var(--foreground))] transition-transform duration-300">
        {getIcon()}
      </div>
    </button>
  );
}

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="theme-select" className="text-sm font-medium text-[hsl(var(--foreground))]">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="input text-sm w-auto min-w-[100px]"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
