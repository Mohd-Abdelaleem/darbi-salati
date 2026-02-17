import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import logoWhite from '@/assets/logo-white.png';
import logoGradient from '@/assets/logo-gradient.png';

interface SplashScreenProps {
  show: boolean;
}

export default function SplashScreen({ show }: SplashScreenProps) {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoWhite : logoGradient;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Decorative glow */}
          <motion.div
            className="absolute w-64 h-64 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, hsl(217 91% 60% / 0.4) 0%, transparent 70%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.4, 0.2] }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />

          {/* Logo */}
          <motion.img
            src={logo}
            alt="أدومها"
            className="h-20 w-auto object-contain relative z-10"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
          />

          {/* Tagline */}
          <motion.p
            className="mt-4 text-muted-foreground text-sm font-tajawal tracking-wide relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            أحبُّ الأعمالِ إلى اللهِ أدومُها وإن قلَّ
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            className="mt-8 flex gap-1.5 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
