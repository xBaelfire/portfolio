import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download, Code2, Heart, Coffee, Lightbulb } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { getSettings } from '@/lib/api';

const DEFAULT_FACTS = [
  { icon: Code2, label: 'Lines of Code', value: '500K+', color: 'text-indigo-400' },
  { icon: Coffee, label: 'Cups of Coffee', value: '1K+', color: 'text-amber-400' },
  { icon: Heart, label: 'Satisfied Clients', value: '30+', color: 'text-rose-400' },
  { icon: Lightbulb, label: 'Side Projects', value: '15+', color: 'text-yellow-400' },
];

const DEFAULT_HIGHLIGHTS = [
  'React & TypeScript',
  'Node.js',
  'Cloud Architecture',
  'UI/UX Design',
  'Performance Optimization',
];

const DEFAULT_BIO_P2 = "When I'm not coding, I'm exploring new technologies, contributing to open source, or sharing knowledge through my blog. I believe in writing clean, maintainable code that scales with business needs.";

function buildFacts(settings: Record<string, string>) {
  return [
    { icon: Code2, label: 'Lines of Code', value: '500K+', color: 'text-indigo-400' },
    { icon: Coffee, label: 'Cups of Coffee', value: '1K+', color: 'text-amber-400' },
    {
      icon: Heart,
      label: 'Satisfied Clients',
      value: settings.stats_clients ? `${settings.stats_clients}+` : DEFAULT_FACTS[2].value,
      color: 'text-rose-400',
    },
    {
      icon: Lightbulb,
      label: 'Side Projects',
      value: settings.stats_projects ? `${settings.stats_projects}+` : DEFAULT_FACTS[3].value,
      color: 'text-yellow-400',
    },
  ];
}

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
          setSettingsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSettingsLoaded(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const highlights = settings.about_highlights
    ? settings.about_highlights.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_HIGHLIGHTS;

  const facts = buildFacts(settings);

  const yearsExp = settings.stats_years || '5';
  const projectsCount = settings.stats_projects || '50';
  const name = settings.site_name || 'Alex Chen';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const resumeUrl = settings.resume_url || '/resume.pdf';

  const bioText = settings.about_bio;
  const bioParagraphs = bioText
    ? bioText.split('\n').filter(Boolean)
    : null;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section
      id="about"
      className="section relative"
      style={{ opacity: settingsLoaded ? 1 : 0.6, transition: 'opacity 0.4s ease-in-out' }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 right-0 w-80 h-80 -translate-y-1/2 opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center"
        >
          {/* Left: Text content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <SectionTitle
              number="01"
              label="About Me"
              title="Passionate About Building Great Software"
              subtitle={`I'm a full stack developer with ${yearsExp}+ years of experience crafting scalable web applications.`}
            />

            <motion.div variants={itemVariants} className="flex flex-col gap-4 text-slate-400 leading-relaxed">
              {bioParagraphs ? (
                bioParagraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>
                    I specialize in building end-to-end web applications with a focus on{' '}
                    {highlights.slice(0, 2).map((h, i) => (
                      <span key={h}>
                        <span className="text-indigo-400 font-medium">{h}</span>
                        {i < 1 && ' and '}
                      </span>
                    ))}
                    . My approach combines technical expertise with an eye for design to create
                    seamless user experiences.
                  </p>
                  <p>{DEFAULT_BIO_P2}</p>
                  <p>
                    Currently available for{' '}
                    <span className="text-green-400 font-medium">freelance projects</span> and
                    open to full-time opportunities with innovative companies.
                  </p>
                </>
              )}
            </motion.div>

            {/* Highlight tags */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              {highlights.map((h) => (
                <span key={h} className="tag-pill">{h}</span>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="primary"
                leftIcon={<Download size={16} />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resumeUrl;
                  link.download = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
                  link.click();
                }}
              >
                Download Resume
              </Button>
            </motion.div>
          </div>

          {/* Right: Avatar / Image */}
          <motion.div
            variants={itemVariants}
            className="relative flex items-center justify-center py-8"
          >
            {/* Outer rotating border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-30"
              style={{
                background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, transparent, #6366f1)',
              }}
            />

            {/* Main avatar container */}
            <div
              className="relative w-44 h-44 sm:w-64 sm:h-64 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e1a3a 50%, #2d1b69 100%)',
                border: '2px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 60px rgba(99,102,241,0.2)',
              }}
            >
              <span
                className="text-5xl sm:text-7xl font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {initials}
              </span>
            </div>

            {/* Floating badge - Experience */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="absolute bottom-2 right-2 sm:bottom-0 sm:right-0 glass border border-indigo-500/30 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold gradient-text">{yearsExp}+</div>
              <div className="text-[10px] sm:text-xs text-slate-400">Years Exp.</div>
            </motion.div>

            {/* Floating badge - Projects */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              className="absolute top-2 left-2 sm:top-0 sm:left-0 glass border border-purple-500/30 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold gradient-text">{projectsCount}+</div>
              <div className="text-[10px] sm:text-xs text-slate-400">Projects</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats / Facts cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 sm:mt-20"
        >
          {facts.map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass border border-white/5 rounded-2xl p-4 sm:p-6 text-center group hover:border-indigo-500/20 transition-colors"
            >
              <div className={`${color} mb-3 flex justify-center`}>
                <Icon size={24} />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-xs sm:text-sm text-slate-500">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
