import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { scrollToSection } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', sectionId: 'hero' },
  { label: 'About', sectionId: 'about' },
  { label: 'Skills', sectionId: 'skills' },
  { label: 'Projects', sectionId: 'projects' },
  { label: 'Blog', sectionId: 'blog-preview' },
  { label: 'Contact', sectionId: 'contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeSection = useScrollSpy(navItems.map((n) => n.sectionId));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass border-b border-white/5 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => scrollToSection('hero')}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-1 font-extrabold text-xl tracking-tight"
          >
            <span className="text-white">Alex</span>
            <span className="text-indigo-500">.</span>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.sectionId}
                onClick={() => handleNavClick(item.sectionId)}
                whileHover={{ y: -1 }}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  activeSection === item.sectionId
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {activeSection === item.sectionId && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:flex"
              onClick={() => handleNavClick('contact')}
            >
              Contact Me
            </Button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-gray-950/95 backdrop-blur-xl"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Menu content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-gray-900 border-l border-white/5 flex flex-col pt-20 pb-8 px-6"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <nav className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.sectionId}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNavClick(item.sectionId)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors',
                      activeSection === item.sectionId
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="text-xs font-mono text-indigo-400/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </motion.button>
                ))}
              </nav>

              <div className="mt-auto">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => handleNavClick('contact')}
                >
                  Contact Me
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
