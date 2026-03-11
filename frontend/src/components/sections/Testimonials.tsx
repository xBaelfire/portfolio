import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getTestimonials, type TestimonialEntry } from '@/lib/api';

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function LoadingSkeleton() {
  return (
    <section id="testimonials" className="section relative bg-gray-900/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-12 lg:px-16">
        <SectionTitle
          number="05"
          label="Testimonials"
          title="What Clients Say"
          subtitle="Kind words from people I have had the pleasure to work with."
          align="center"
          className="mb-16"
        />

        <div className="glass border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[18px] h-[18px] rounded bg-slate-700/50 animate-pulse" />
            ))}
          </div>
          <div className="space-y-3 mb-8 max-w-2xl mx-auto">
            <div className="h-5 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-5 bg-slate-700/50 rounded animate-pulse w-5/6 mx-auto" />
            <div className="h-5 bg-slate-700/50 rounded animate-pulse w-4/6 mx-auto" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-700/50 animate-pulse" />
            <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-3 w-40 bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<readonly TestimonialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const data = await getTestimonials();
        if (!cancelled) {
          setTestimonials(data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goTo = useCallback((index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }, [activeIndex]);

  const restartInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    if (testimonials.length === 0) return;
    restartInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [restartInterval, testimonials.length]);

  const handleNavClick = useCallback((fn: () => void) => {
    fn();
    restartInterval();
  }, [restartInterval]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    }),
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (testimonials.length === 0) {
    return null;
  }

  const active = testimonials[activeIndex];

  return (
    <section id="testimonials" className="section relative bg-gray-900/20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-12 lg:px-16">
        <SectionTitle
          number="05"
          label="Testimonials"
          title="What Clients Say"
          subtitle="Kind words from people I have had the pleasure to work with."
          align="center"
          className="mb-16"
        />

        {/* Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden"
            >
              {/* Quote icon */}
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 text-indigo-500/20">
                <Quote size={40} className="sm:hidden" />
                <Quote size={60} className="hidden sm:block" />
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: active.rating }).map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                "{active.quote}"
              </blockquote>

              {/* Person */}
              <div className="flex flex-col items-center gap-3">
                {/* Avatar */}
                {active.avatar_url ? (
                  <img
                    src={active.avatar_url}
                    alt={active.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${AVATAR_COLORS[activeIndex % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {getInitials(active.name)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white">{active.name}</div>
                  <div className="text-sm text-slate-400">
                    {active.role} at <span className="text-indigo-400">{active.company}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows - desktop: outside card, mobile: below card */}
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNavClick(prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full glass border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-colors hidden sm:flex"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNavClick(next)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full glass border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-colors hidden sm:flex"
          >
            <ChevronRight size={18} />
          </motion.button>

          {/* Mobile navigation arrows */}
          <div className="flex sm:hidden items-center justify-center gap-4 mt-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(prev)}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 active:text-white active:border-indigo-500/30 transition-colors"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <span className="text-xs text-slate-500 font-mono">{activeIndex + 1} / {testimonials.length}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(next)}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 active:text-white active:border-indigo-500/30 transition-colors"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => handleNavClick(() => goTo(i))}
              whileHover={{ scale: 1.2 }}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? 'w-6 h-2 bg-indigo-500'
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
