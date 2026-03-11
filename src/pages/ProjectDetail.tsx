import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink, ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Static project data (would come from API in production)
const PROJECTS = [
  {
    id: '1',
    slug: 'ecommerce-platform',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with real-time inventory management, Stripe payments, and a comprehensive admin dashboard.',
    long_description: `
      <p>This platform was built for a growing retail business that needed to modernize their online presence.
      The challenge was to create a performant, scalable solution that could handle thousands of concurrent users
      while maintaining real-time inventory accuracy.</p>

      <h2>Key Features</h2>
      <ul>
        <li>Real-time inventory management with WebSocket updates</li>
        <li>Stripe integration with support for subscriptions and one-time payments</li>
        <li>Admin dashboard with analytics, order management, and product catalog</li>
        <li>Server-side rendering for SEO optimization</li>
        <li>Advanced search with Elasticsearch</li>
        <li>Automated email notifications with transactional templates</li>
      </ul>

      <h2>Technical Approach</h2>
      <p>The frontend was built with Next.js for SSR capabilities and optimal performance.
      The backend uses Node.js with a PostgreSQL database, with Redis for caching frequently
      accessed data like product catalogs and session management.</p>
    `,
    image_url: '',
    tech_stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'Elasticsearch', 'Docker', 'AWS'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web',
    featured: true,
    gradient: 'from-indigo-900 via-purple-900 to-gray-900',
    features: [
      'Real-time inventory updates via WebSockets',
      'Stripe payment processing with subscriptions',
      'Multi-currency support (15+ currencies)',
      'Admin analytics dashboard',
      'SEO-optimized with server-side rendering',
      'Automated email notifications',
      'Advanced search with filters',
      'Mobile-responsive design',
    ],
  },
  {
    id: '2',
    slug: 'ai-dashboard',
    title: 'AI Analytics Dashboard',
    description: 'Real-time data visualization dashboard powered by machine learning insights.',
    long_description: `<p>An enterprise analytics platform that combines real-time data streaming with ML-powered insights.</p>`,
    image_url: '',
    tech_stack: ['Next.js', 'Python', 'TensorFlow', 'D3.js', 'AWS', 'FastAPI', 'PostgreSQL'],
    github_url: 'https://github.com',
    live_url: 'https://example.com',
    category: 'web',
    featured: true,
    gradient: 'from-cyan-900 via-blue-900 to-gray-900',
    features: ['ML-powered predictions', 'Real-time data streaming', 'Interactive D3.js charts', 'Role-based access control'],
  },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = PROJECTS.find((p) => p.id === id || p.slug === id);
  const currentIndex = project ? PROJECTS.indexOf(project) : -1;
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className={`relative h-64 sm:h-96 bg-gradient-to-br ${project.gradient}`}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-extrabold text-white text-center px-4"
          >
            {project.title}
          </motion.h1>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6"
        >
          <Link
            to="/#projects"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm glass border border-white/10 px-3 py-2 rounded-lg"
          >
            <ChevronLeft size={16} />
            Back to Projects
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Project meta & links */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5">
            <div>
              <span className="tag-pill capitalize">{project.category}</span>
              {project.featured && (
                <span className="ml-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {project.github_url && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Github size={14} />}
                  onClick={() => window.open(project.github_url, '_blank')}
                >
                  GitHub
                </Button>
              )}
              {project.live_url && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<ExternalLink size={14} />}
                  onClick={() => window.open(project.live_url, '_blank')}
                >
                  Live Demo
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-indigo max-w-none mb-10">
            <p className="text-lg text-slate-300 leading-relaxed mb-6">{project.description}</p>
            <div
              className="text-slate-400 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: project.long_description }}
            />
          </div>

          {/* Features */}
          {project.features && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 glass border border-white/5 rounded-xl p-4">
                    <span className="text-indigo-400 mt-0.5">✓</span>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech stack */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 glass border border-indigo-500/20 rounded-xl text-sm text-indigo-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="gradient-line mb-8" />
          <div className="flex items-center justify-between gap-4">
            {prevProject ? (
              <Link
                to={`/projects/${prevProject.id}`}
                className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Previous</div>
                  <div className="text-sm font-medium">{prevProject.title}</div>
                </div>
              </Link>
            ) : <div />}

            {nextProject ? (
              <Link
                to={`/projects/${nextProject.id}`}
                className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors text-right"
              >
                <div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Next</div>
                  <div className="text-sm font-medium">{nextProject.title}</div>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
