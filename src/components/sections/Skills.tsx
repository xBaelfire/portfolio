import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '@/components/ui/SectionTitle';
import type { SkillCategory } from '@/types';

const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    skills: [
      { name: 'React', icon: '⚛️', proficiency: 95, category: 'frontend', color: '#61dafb' },
      { name: 'TypeScript', icon: '🔷', proficiency: 92, category: 'frontend', color: '#3178c6' },
      { name: 'Next.js', icon: '▲', proficiency: 88, category: 'frontend', color: '#fff' },
      { name: 'Tailwind CSS', icon: '🎨', proficiency: 95, category: 'frontend', color: '#38bdf8' },
      { name: 'Framer Motion', icon: '🎬', proficiency: 82, category: 'frontend', color: '#ff4d4d' },
      { name: 'Vue.js', icon: '💚', proficiency: 75, category: 'frontend', color: '#42b883' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    skills: [
      { name: 'Node.js', icon: '🟢', proficiency: 90, category: 'backend', color: '#339933' },
      { name: 'Python', icon: '🐍', proficiency: 85, category: 'backend', color: '#3776ab' },
      { name: 'PostgreSQL', icon: '🐘', proficiency: 88, category: 'backend', color: '#336791' },
      { name: 'Redis', icon: '🔴', proficiency: 78, category: 'backend', color: '#dc382d' },
      { name: 'GraphQL', icon: '◈', proficiency: 80, category: 'backend', color: '#e10098' },
      { name: 'REST APIs', icon: '🔗', proficiency: 95, category: 'backend', color: '#6366f1' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & DevOps',
    skills: [
      { name: 'Docker', icon: '🐋', proficiency: 82, category: 'tools', color: '#2496ed' },
      { name: 'AWS', icon: '☁️', proficiency: 78, category: 'tools', color: '#ff9900' },
      { name: 'Git', icon: '🔀', proficiency: 95, category: 'tools', color: '#f05032' },
      { name: 'CI/CD', icon: '⚙️', proficiency: 80, category: 'tools', color: '#6366f1' },
      { name: 'Linux', icon: '🐧', proficiency: 85, category: 'tools', color: '#fcc624' },
      { name: 'Cloudflare', icon: '🌐', proficiency: 76, category: 'tools', color: '#f38020' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    skills: [
      { name: 'Figma', icon: '🎨', proficiency: 88, category: 'design', color: '#f24e1e' },
      { name: 'UI/UX', icon: '✨', proficiency: 84, category: 'design', color: '#6366f1' },
      { name: 'Prototyping', icon: '📐', proficiency: 80, category: 'design', color: '#8b5cf6' },
      { name: 'Design Systems', icon: '📦', proficiency: 82, category: 'design', color: '#ec4899' },
      { name: 'Motion Design', icon: '🎭', proficiency: 75, category: 'design', color: '#06b6d4' },
      { name: 'Accessibility', icon: '♿', proficiency: 85, category: 'design', color: '#22c55e' },
    ],
  },
];

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
  const [activeTab, setActiveTab] = useState<SkillCategory['id']>('frontend');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const activeCategory = skillCategories.find((c) => c.id === activeTab)!;

  return (
    <section id="skills" className="section relative overflow-hidden bg-gray-900/30">
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
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-12">
            {skillCategories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
                  className="glass border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-colors"
                >
                  <SkillBar skill={skill} isInView={isInView} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
