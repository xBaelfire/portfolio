import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { getPosts } from '@/lib/api';
import type { BlogPost } from '@/types';

const GRADIENT_CYCLE = [
  'from-indigo-900/60 to-purple-900/60',
  'from-cyan-900/60 to-blue-900/60',
  'from-emerald-900/60 to-teal-900/60',
];

export function BlogPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [posts, setPosts] = useState<readonly BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const res = await getPosts({ published: true, per_page: 3 });
        if (!cancelled) {
          const data = Array.isArray(res) ? res : res.data;
          setPosts(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load posts';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, []);

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
          {loading && (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="glass border border-white/5 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-36 sm:h-44 bg-white/5" />
                  <div className="p-5 sm:p-6 flex flex-col gap-3">
                    <div className="flex gap-4">
                      <div className="h-3 w-20 bg-white/5 rounded" />
                      <div className="h-3 w-16 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-2/3 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </>
          )}

          {error && !loading && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 mb-4">Unable to load articles right now.</p>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && posts.map((post, i) => {
            const gradient = GRADIENT_CYCLE[i % GRADIENT_CYCLE.length];
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group glass border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-colors"
              >
                {/* Cover gradient */}
                <div className={`relative h-36 sm:h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
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
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
