import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const ALL_POSTS = [
  {
    id: '1',
    slug: 'building-scalable-react-apps',
    title: 'Building Scalable React Applications in 2025',
    excerpt: 'Best practices for structuring large React codebases, state management patterns, and performance optimization techniques that scale.',
    tags: ['React', 'TypeScript', 'Architecture'],
    created_at: '2025-03-01',
    read_time: 8,
    gradient: 'from-indigo-900/60 to-purple-900/60',
  },
  {
    id: '2',
    slug: 'cloudflare-workers-guide',
    title: 'The Complete Guide to Cloudflare Workers',
    excerpt: 'Everything you need to know about deploying serverless applications at the edge with Cloudflare Workers, D1, and R2.',
    tags: ['Cloudflare', 'Serverless', 'Edge Computing'],
    created_at: '2025-02-15',
    read_time: 12,
    gradient: 'from-cyan-900/60 to-blue-900/60',
  },
  {
    id: '3',
    slug: 'modern-css-techniques',
    title: 'Modern CSS Techniques Every Developer Should Know',
    excerpt: 'A deep dive into container queries, CSS nesting, @layer, and other cutting-edge CSS features for building maintainable stylesheets.',
    tags: ['CSS', 'Design', 'Frontend'],
    created_at: '2025-01-28',
    read_time: 6,
    gradient: 'from-emerald-900/60 to-teal-900/60',
  },
  {
    id: '4',
    slug: 'postgresql-performance-tips',
    title: 'PostgreSQL Performance Optimization Techniques',
    excerpt: 'Practical tips for writing faster queries, using indexes effectively, and optimizing your PostgreSQL database for production workloads.',
    tags: ['PostgreSQL', 'Backend', 'Performance'],
    created_at: '2025-01-10',
    read_time: 10,
    gradient: 'from-blue-900/60 to-indigo-900/60',
  },
  {
    id: '5',
    slug: 'framer-motion-animations',
    title: 'Advanced Animations with Framer Motion',
    excerpt: 'Learn how to create stunning animations in React using Framer Motion\'s powerful animation primitives and layout animations.',
    tags: ['React', 'Animation', 'Frontend'],
    created_at: '2024-12-20',
    read_time: 7,
    gradient: 'from-rose-900/60 to-pink-900/60',
  },
  {
    id: '6',
    slug: 'docker-best-practices',
    title: 'Docker Best Practices for Node.js Applications',
    excerpt: 'How to write efficient Dockerfiles, reduce image sizes, and set up multi-stage builds for production Node.js deployments.',
    tags: ['Docker', 'Node.js', 'DevOps'],
    created_at: '2024-12-05',
    read_time: 9,
    gradient: 'from-orange-900/60 to-amber-900/60',
  },
];

const ALL_TAGS = ['All', ...Array.from(new Set(ALL_POSTS.flatMap((p) => p.tags)))];
const POSTS_PER_PAGE = 6;

export function Blog() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let posts = ALL_POSTS;
    if (activeTag !== 'All') {
      posts = posts.filter((p) => p.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
      );
    }
    return posts;
  }, [search, activeTag]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const displayed = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-15"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase mb-4">Blog</p>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
              Thoughts &{' '}
              <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Articles on web development, design, and building great software products.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Search & filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => { setActiveTag(tag); setPage(1); }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTag === tag
                    ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-slate-500 mb-6">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* Posts grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayed.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="group glass border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-colors"
              >
                {/* Cover */}
                <div className={`relative h-44 bg-gradient-to-br ${post.gradient}`}>
                  <div className="absolute inset-0 grid-bg opacity-30" />
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setActiveTag(tag); setPage(1); }}
                        className="tag-pill hover:bg-indigo-500/20 transition-colors"
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={11} />
                      {formatDate(post.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {post.read_time} min read
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                    {post.title}
                  </h2>

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-1 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium group/link transition-colors"
                  >
                    Read More
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria.</p>
            <Button variant="ghost" onClick={() => { setSearch(''); setActiveTag('All'); }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </motion.button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
