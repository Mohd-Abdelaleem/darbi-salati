import { Bell } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/use-theme';
import logoWhite from '@/assets/logo-white.png';
import logoGradient from '@/assets/logo-gradient.png';

interface AppHeaderProps {
  children?: ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2" dir="rtl">
      {/* Right: Logo */}
      <Link to="/" className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.img
            key={theme}
            src={theme === 'dark' ? logoWhite : logoGradient}
            alt="أدومها"
            className="h-10 w-auto object-contain"
            initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: 8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </AnimatePresence>
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
