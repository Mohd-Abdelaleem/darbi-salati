import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-full glass glass-hover flex items-center justify-center transition-all duration-300",
        "hover:scale-105 active:scale-95"
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-foreground/70" />
      ) : (
        <Sun className="w-5 h-5 text-foreground/70" />
      )}
    </button>
  );
}
