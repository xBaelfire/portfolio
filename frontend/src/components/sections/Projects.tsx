import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import type { ProjectCategory } from '@/types';

const PROJECTS = [
  {
    id: '1',
    slug: 'ecommerce-platform',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with real-time inventory, Stripe payments, and admin dashboard.',
    image_url: '',
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web' as const,
    featured: true,
    gradient: 'from-indigo-900 via-purple-900 to-gray-900',
  },
  {
    id: '2',
    slug: 'ai-dashboard',
    title: 'AI Analytics Dashboard',
    description: 'Real-time data visualization dashboard powered by machine learning insights.',
    image_url: '',
    tech_stack: ['Next.js', 'Python', 'TensorFlow', 'D3.js', 'AWS'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web' as const,
    featured: true,
    gradient: 'from-cyan-900 via-blue-900 to-gray-900',
  },
  {
    id: '3',
    slug: 'mobile-fintech',
    title: 'FinTech Mobile App',
    description: 'Cross-platform mobile banking app with biometric auth and instant transfers.',
    image_url: '',
    tech_stack: ['React Native', 'TypeScript', 'Plaid API', 'Expo'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'mobile' as const,
    featured: false,
    gradient: 'from-emerald-900 via-teal-900 to-gray-900',
  },
  {
    id: '4',
    slug: 'design-system',
    title: 'Design System Library',
    description: 'Comprehensive React component library with Storybook docs, 60+ components.',
    image_url: '',
    tech_stack: ['React', 'TypeScript', 'Storybook', 'Rollup'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'design' as const,
    featured: false,
    gradient: 'from-pink-900 via-rose-900 to-gray-900',
  },
  {
    id: '5',
    slug: 'devops-platform',
    title: 'DevOps Automation Tool',
    description: 'CI/CD pipeline management with GitHub Actions integration and Slack notifications.',
    image_url: '',
    tech_stack: ['Go', 'Docker', 'Kubernetes', 'GitHub Actions'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web' as const,
    featured: false,
    gradient: 'from-orange-900 via-amber-900 to-gray-900',
  },
  {
    id: '6',
    slug: 'social-platform',
    title: 'Social Learning Platform',
    description: 'Education platform with live video, quizzes, progress tracking, and certificates.',
    image_url: '',
    tech_stack: ['Next.js', 'WebRTC', 'Socket.io', 'MongoDB'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web' as const,
    featured: true,
    gradient: 'from-violet-900 via-purple-900 to-gray-900',
  },
];

const filters: { label: string; value: ProjectCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Design', value: 'design' },
];

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all');
  const [showAll, setShowAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const filtered = PROJECTS.filter(
    (p) => activeFilter === 'all' || p.category === activeFilter
  );
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section id="projects" className="section relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <SectionTitle
            number="03"
            label="My Work"
            title="Featured Projects"
            subtitle="A selection of projects I've built with passion."
          />

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 glass rounded-xl border border-white/5 overflow-x-auto">
            {filters.map(({ label, value }) => (
              <motion.button
                key={value}
                onClick={() => setActiveFilter(value)}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === value
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeFilter === value && (
                  <motion.span
                    layoutId="project-filter"
                    className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        <motion.div
          ref={ref}
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayed.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: isInView ? i * 0.07 : 0 }}
                whileHover={{ y: -6 }}
                className="group glass border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-colors"
              >
                {/* Card image / gradient */}
                <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 grid-bg opacity-30" />

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-2xl border border-white/10"
                    >
                      {project.category === 'web' ? '🌐' : project.category === 'mobile' ? '📱' : '🎨'}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <motion.a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-indigo-500/30 hover:border-indigo-500/50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={16} />
                    </motion.a>
                    <motion.a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-indigo-500/30 hover:border-indigo-500/50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                    </motion.a>
                  </div>

                  {/* Featured badge */}
                  {project.featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
                      Featured
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div className="p-6 flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {project.tech_stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="tag-pill">{tech}</span>
                    ))}
                    {project.tech_stack.length > 4 && (
                      <span className="tag-pill">+{project.tech_stack.length - 4}</span>
                    )}
                  </div>

                  {/* View details link */}
                  <Link
                    to={`/projects/${project.id}`}
                    className="mt-2 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium group/link transition-colors"
                  >
                    View Details
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load more */}
        {filtered.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Load More (${filtered.length - 6} more)`}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
