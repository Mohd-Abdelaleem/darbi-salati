import { Bell } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/logo.jpeg';

interface AppHeaderProps {
  children?: ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2" dir="rtl">
      {/* Right: Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="أدومها" className="h-10 w-auto rounded-lg object-contain" />
      </Link>

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
