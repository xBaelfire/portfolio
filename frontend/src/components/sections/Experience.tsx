import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';

const experiences = [
  {
    id: '1',
    company: 'TechVision Inc.',
    role: 'Senior Full Stack Engineer',
    start_date: '2022-01',
    end_date: null,
    is_current: true,
    location: 'San Francisco, CA (Remote)',
    description: 'Leading development of a SaaS platform serving 50K+ users. Architected microservices migration reducing latency by 40%. Mentored junior developers and established best practices.',
    tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'AWS', 'Docker'],
    company_url: 'https://example.com',
  },
  {
    id: '2',
    company: 'DigitalCraft Agency',
    role: 'Full Stack Developer',
    start_date: '2020-03',
    end_date: '2021-12',
    is_current: false,
    location: 'New York, NY',
    description: 'Built and maintained 15+ client websites and web applications. Introduced React to the frontend stack. Implemented automated testing increasing code coverage from 20% to 85%.',
    tech_stack: ['React', 'Vue.js', 'PHP', 'MySQL', 'Laravel', 'AWS'],
    company_url: 'https://example.com',
  },
  {
    id: '3',
    company: 'StartupLab',
    role: 'Frontend Developer',
    start_date: '2019-06',
    end_date: '2020-02',
    is_current: false,
    location: 'Austin, TX',
    description: 'Developed responsive UI components for a B2B analytics product. Collaborated closely with design team to implement pixel-perfect interfaces. Reduced bundle size by 35% through code splitting.',
    tech_stack: ['React', 'JavaScript', 'SCSS', 'Webpack', 'REST APIs'],
    company_url: 'https://example.com',
  },
  {
    id: '4',
    company: 'Freelance',
    role: 'Web Developer',
    start_date: '2018-01',
    end_date: '2019-05',
    is_current: false,
    location: 'Remote',
    description: 'Delivered 20+ freelance projects for small businesses and startups. Focused on e-commerce solutions, landing pages, and CMS implementations.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Shopify'],
    company_url: null,
  },
];

function ExperienceCard({
  experience,
}: {
  experience: typeof experiences[0];
}) {
  const startYear = experience.start_date.split('-')[0];
  const endYear = experience.end_date ? experience.end_date.split('-')[0] : 'Present';

  return (
    <div className="glass border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-indigo-500/20 transition-colors group">
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

function DesktopTimeline({ experiences: items, isInView }: { experiences: typeof experiences; isInView: boolean }) {
  return (
    <div className="hidden lg:block relative">
      {/* Timeline vertical line */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" as const }}
          className="w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #6366f1, #8b5cf6, rgba(99,102,241,0.1))',
            transformOrigin: 'top',
          }}
        />
      </div>

      {items.map((exp, i) => {
        const isLeft = i % 2 === 0;
        const startYear = exp.start_date.split('-')[0];

        return (
          <div key={exp.id} className={`relative flex items-start gap-0 ${isLeft ? 'flex-row' : 'flex-row-reverse'} mb-16 last:mb-0`}>
            <motion.div
              initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" as const }}
              className={`w-5/12 ${isLeft ? 'pr-12' : 'pl-12'}`}
            >
              <ExperienceCard experience={exp} />
            </motion.div>

            {/* Center timeline dot */}
            <div className="w-2/12 flex flex-col items-center relative">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-gray-950 z-10 relative"
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

            <div className="w-5/12" />
          </div>
        );
      })}
    </div>
  );
}

function MobileTimeline({ experiences: items, isInView }: { experiences: typeof experiences; isInView: boolean }) {
  return (
    <div className="lg:hidden relative pl-8">
      {/* Timeline vertical line */}
      <div className="absolute left-3 top-0 w-0.5 h-full">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" as const }}
          className="w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #6366f1, #8b5cf6, rgba(99,102,241,0.1))',
            transformOrigin: 'top',
          }}
        />
      </div>

      {items.map((exp, i) => (
        <div key={exp.id} className="relative mb-8 last:mb-0">
          {/* Timeline dot */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
            className="absolute -left-8 top-6 w-4 h-4 rounded-full border-2 border-indigo-500 bg-gray-950 z-10"
            style={{ boxShadow: '0 0 12px rgba(99,102,241,0.5)', transform: 'translateX(calc(-50% + 12px))' }}
          >
            <div className="absolute inset-0.5 rounded-full bg-indigo-500" />
          </motion.div>

          {/* Year label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: i * 0.1 + 0.1 }}
            className="text-xs font-mono text-indigo-400 mb-2"
          >
            {exp.start_date.split('-')[0]}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
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

  return (
    <section id="experience" className="section relative overflow-hidden bg-gray-900/20">
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
          <DesktopTimeline experiences={experiences} isInView={isInView} />
          <MobileTimeline experiences={experiences} isInView={isInView} />
        </div>
      </div>
    </section>
  );
}
