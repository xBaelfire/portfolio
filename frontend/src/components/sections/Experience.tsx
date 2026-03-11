import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getExperience, type ExperienceEntry } from '@/lib/api';

function LoadingSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass border border-white/5 rounded-2xl p-6 sm:p-8 animate-pulse"
        >
          <div className="h-5 w-48 bg-white/10 rounded mb-3" />
          <div className="h-4 w-32 bg-indigo-500/10 rounded mb-4" />
          <div className="flex gap-3 mb-4">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-3/4 bg-white/5 rounded" />
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-5 w-16 bg-white/5 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceCard({
  experience,
}: {
  experience: ExperienceEntry;
}) {
  const startYear = experience.start_date.split('-')[0];
  const endYear = experience.end_date ? experience.end_date.split('-')[0] : 'Present';

  return (
    <div className="glass border border-white/5 rounded-2xl p-6 sm:p-8 hover:border-indigo-500/20 transition-colors group">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {experience.role}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {experience.company_url ? (
              <a
                href={experience.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 font-medium text-sm hover:text-indigo-300 flex items-center gap-1"
              >
                {experience.company}
                <ExternalLink size={12} />
              </a>
            ) : (
              <span className="text-indigo-400 font-medium text-sm">{experience.company}</span>
            )}
          </div>
        </div>
        {experience.is_current && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Current
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
        <span className="font-mono">{startYear} — {endYear}</span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {experience.location}
        </span>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-4">{experience.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {experience.tech_stack.map((tech) => (
          <span key={tech} className="tag-pill">{tech}</span>
        ))}
      </div>
    </div>
  );
}

function DesktopTimeline({ experiences: items, isInView }: { experiences: readonly ExperienceEntry[]; isInView: boolean }) {
  return (
    <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] gap-x-8 relative">
      {/* Timeline vertical line - absolute so it spans full height */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" as const }}
        className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
        style={{
          background: 'linear-gradient(180deg, #6366f1, #8b5cf6, rgba(99,102,241,0.1))',
          transformOrigin: 'top',
        }}
      />

      {items.map((exp, i) => {
        const isLeft = i % 2 === 0;
        const startYear = exp.start_date.split('-')[0];

        return (
          <div key={exp.id} className="contents">
            {/* Left column */}
            <div className={`${isLeft ? '' : ''} flex ${isLeft ? 'justify-end' : 'justify-start'}`}
              style={{ gridColumn: isLeft ? 1 : 3, gridRow: i + 1 }}
            >
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" as const }}
                className="w-full max-w-md mb-12"
              >
                <ExperienceCard experience={exp} />
              </motion.div>
            </div>

            {/* Center dot */}
            <div className="flex flex-col items-center relative"
              style={{ gridColumn: 2, gridRow: i + 1 }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-gray-950 z-10 relative mt-6"
                style={{ boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
              >
                <div className="absolute inset-1 rounded-full bg-indigo-500" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="mt-2 text-xs font-mono text-indigo-400"
              >
                {startYear}
              </motion.div>
            </div>

            {/* Empty spacer on opposite side */}
            <div style={{ gridColumn: isLeft ? 3 : 1, gridRow: i + 1 }} />
          </div>
        );
      })}
    </div>
  );
}

function MobileTimeline({ experiences: items, isInView }: { experiences: readonly ExperienceEntry[]; isInView: boolean }) {
  return (
    <div className="lg:hidden relative ml-4 pl-8 sm:ml-6 sm:pl-10">
      {/* Timeline vertical line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" as const }}
        className="absolute left-0 top-0 w-0.5 h-full"
        style={{
          background: 'linear-gradient(180deg, #6366f1, #8b5cf6, rgba(99,102,241,0.1))',
          transformOrigin: 'top',
        }}
      />

      {items.map((exp, i) => (
        <div key={exp.id} className="relative mb-8 last:mb-0">
          {/* Timeline dot — centered on the line (left: 0) */}
          <div className="absolute top-6 z-10" style={{ left: '-1.0625rem' }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
              className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-gray-950 relative"
              style={{ boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
            >
              <div className="absolute inset-0.5 rounded-full bg-indigo-500" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" as const }}
          >
            <ExperienceCard experience={exp} />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const [experiences, setExperiences] = useState<readonly ExperienceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchExperience() {
      try {
        const data = await getExperience();
        if (!cancelled) {
          setExperiences(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load experience data';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchExperience();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoading && (error || experiences.length === 0)) {
    return null;
  }

  return (
    <section id="experience" className="section relative bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          number="04"
          label="Experience"
          title="My Journey"
          subtitle="Professional experience building products people love."
          align="center"
          className="mb-12 lg:mb-20"
        />

        <div ref={ref}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <DesktopTimeline experiences={experiences} isInView={isInView} />
              <MobileTimeline experiences={experiences} isInView={isInView} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
