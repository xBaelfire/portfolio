import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  number?: string;
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SectionTitle({
  number,
  label,
  title,
  subtitle,
  align = 'left',
  className,
}: SectionTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const alignClasses = {
    left: 'text-left',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={cn('flex flex-col gap-3', alignClasses[align], className)}
    >
      {/* Label / Number */}
      {(number || label) && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3"
          style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}
        >
          {number && (
            <span className="font-mono text-sm font-semibold text-indigo-400">
              {number}
            </span>
          )}
          {number && label && (
            <span className="w-8 h-px bg-indigo-500/50" />
          )}
          {label && (
            <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400 font-mono">
              {label}
            </span>
          )}
        </motion.div>
      )}

      {/* Main title */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
      >
        {title.includes('{accent}') ? (
          <>
            {title.split('{accent}')[0]}
            <span className="gradient-text">{title.split('{accent}')[1]?.split('{/accent}')[0]}</span>
            {title.split('{/accent}')[1]}
          </>
        ) : (
          title
        )}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Decorative line */}
      <motion.div
        variants={{
          hidden: { scaleX: 0 },
          visible: { scaleX: 1, transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.2 } },
        }}
        className="h-px bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent mt-2"
        style={{
          width: '80px',
          transformOrigin: align === 'right' ? 'right' : 'left',
          alignSelf: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        }}
      />
    </motion.div>
  );
}
