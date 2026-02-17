import { Bell } from 'lucide-react';
import { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  children?: ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2" dir="rtl">
      {/* Right: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary glow-blue flex items-center justify-center">
          <span className="text-base font-bold text-white">أ</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">أدومها</h1>
          <span className="text-xs text-muted-foreground">صباح الخير</span>
        </div>
      </div>

      {/* Left: Points + Theme + Bell */}
      <div className="flex items-center gap-2">
        {children}
        <ThemeToggle />
        <button className="w-10 h-10 rounded-full glass glass-hover flex items-center justify-center transition-all duration-200">
          <Bell className="w-5 h-5 text-foreground/70" />
        </button>
      </div>
    </div>
  );
}
