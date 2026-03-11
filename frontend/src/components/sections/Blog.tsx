import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const previewPosts = [
  {
    id: '1',
    slug: 'building-scalable-react-apps',
    title: 'Building Scalable React Applications in 2025',
    excerpt: 'Best practices for structuring large React codebases, state management patterns, and performance optimization techniques.',
    tags: ['React', 'TypeScript', 'Architecture'],
    created_at: '2025-03-01',
    read_time: 8,
    gradient: 'from-indigo-900/60 to-purple-900/60',
  },
  {
    id: '2',
    slug: 'cloudflare-workers-guide',
    title: 'The Complete Guide to Cloudflare Workers',
    excerpt: 'Everything you need to know about deploying serverless applications at the edge with Cloudflare Workers and D1.',
    tags: ['Cloudflare', 'Serverless', 'Edge Computing'],
    created_at: '2025-02-15',
    read_time: 12,
    gradient: 'from-cyan-900/60 to-blue-900/60',
  },
  {
    id: '3',
    slug: 'modern-css-techniques',
    title: 'Modern CSS Techniques Every Developer Should Know',
    excerpt: 'A deep dive into container queries, CSS nesting, @layer, and other cutting-edge CSS features for 2025.',
    tags: ['CSS', 'Design', 'Frontend'],
    created_at: '2025-01-28',
    read_time: 6,
    gradient: 'from-emerald-900/60 to-teal-900/60',
  },
];

export function BlogPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="blog-preview" className="section relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionTitle
            number="06"
            label="Blog"
            title="Latest Articles"
            subtitle="Thoughts on development, design, and the web."
          />
          <Link to="/blog">
            <Button variant="ghost" rightIcon={<ArrowRight size={16} />}>
              View All Posts
            </Button>
          </Link>
        </div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {previewPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group glass border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-colors"
            >
              {/* Cover gradient */}
              <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${post.gradient} overflow-hidden`}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(post.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {post.read_time} min read
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                  {post.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
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
        </motion.div>
      </div>
    </section>
  );
}
