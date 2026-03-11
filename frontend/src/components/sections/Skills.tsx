import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { getSkills } from '@/lib/api';
import type { SkillEntry } from '@/lib/api';
import type { SkillCategory } from '@/types';

const CATEGORY_LABELS: Record<SkillCategory['id'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools & DevOps',
  design: 'Design',
};

const CATEGORY_ORDER: readonly SkillCategory['id'][] = [
  'frontend',
  'backend',
  'tools',
  'design',
];

function groupSkillsByCategory(skills: readonly SkillEntry[]): SkillCategory[] {
  const grouped = new Map<SkillCategory['id'], SkillEntry[]>();

  for (const skill of skills) {
    const existing = grouped.get(skill.category) ?? [];
    grouped.set(skill.category, [...existing, skill]);
  }

  return CATEGORY_ORDER
    .filter((id) => grouped.has(id))
    .map((id) => ({
      id,
      label: CATEGORY_LABELS[id],
      skills: (grouped.get(id) ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          name: s.name,
          icon: s.icon,
          proficiency: s.proficiency,
          category: s.category,
          color: s.color,
        })),
    }));
}

function SkillBarSkeleton() {
  return (
    <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white/10" />
            <div className="w-24 h-4 rounded bg-white/10" />
          </div>
          <div className="w-10 h-3 rounded bg-white/10" />
        </div>
        <div className="h-1.5 bg-white/5 rounded-full" />
      </div>
    </div>
  );
}

function SkillBar({ skill, isInView }: { skill: { name: string; proficiency: number; color?: string; icon: string }; isInView: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{skill.icon}</span>
          <span className="text-sm font-medium text-white">{skill.name}</span>
        </div>
        <span className="text-xs font-mono text-slate-500">{skill.proficiency}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.proficiency}%` } : { width: 0 }}
          transition={{ duration: 1, ease: "easeOut" as const, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #6366f1, ${skill.color ?? '#8b5cf6'})` }}
        />
      </div>
    </div>
  );
}

export function Skills() {
  const [skills, setSkills] = useState<readonly SkillEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SkillCategory['id']>('frontend');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    let cancelled = false;

    async function fetchSkills() {
      try {
        const data = await getSkills();
        if (!cancelled) {
          setSkills(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load skills';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSkills();
    return () => { cancelled = true; };
  }, []);

  const skillCategories = useMemo(() => groupSkillsByCategory(skills), [skills]);

  const activeCategory = skillCategories.find((c) => c.id === activeTab);

  // When data loads, default to first available tab if current tab has no skills
  useEffect(() => {
    if (!loading && skillCategories.length > 0 && !activeCategory) {
      setActiveTab(skillCategories[0].id);
    }
  }, [loading, skillCategories, activeCategory]);

  return (
    <section id="skills" className="section relative bg-gray-900/30">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          number="02"
          label="My Skills"
          title="Technologies I Work With"
          subtitle="A curated set of tools and technologies I use to bring ideas to life."
          className="mb-16"
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Error state */}
          {error && (
            <div className="text-center py-16">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  getSkills()
                    .then((data) => { setSkills(data); })
                    .catch((err) => {
                      const message = err instanceof Error ? err.message : 'Failed to load skills';
                      setError(message);
                    })
                    .finally(() => { setLoading(false); });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !error && (
            <>
              <div className="flex gap-2 mb-8 sm:mb-12 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
                {CATEGORY_ORDER.map((id) => (
                  <div
                    key={id}
                    className="px-5 py-2.5 rounded-xl shrink-0 animate-pulse"
                  >
                    <div className="w-20 h-4 rounded bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <SkillBarSkeleton key={i} />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && !error && skillCategories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">No skills to display yet.</p>
            </div>
          )}

          {/* Loaded content */}
          {!loading && !error && skillCategories.length > 0 && activeCategory && (
            <>
              {/* Tab navigation */}
              <div className="flex gap-2 mb-8 sm:mb-12 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
                {skillCategories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                      activeTab === cat.id
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {activeTab === cat.id && (
                      <motion.span
                        layoutId="skills-tab-indicator"
                        className="absolute inset-0 bg-indigo-500/15 border border-indigo-500/30 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Skills grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {activeCategory.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/20 transition-colors"
                    >
                      <SkillBar skill={skill} isInView={isInView} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
