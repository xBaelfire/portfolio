import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { getPost, getPosts } from '@/lib/api';
import type { BlogPost as BlogPostType } from '@/types';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<readonly BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [postData, allPostsRes] = await Promise.all([
          getPost(slug ?? ''),
          getPosts({ published: true, per_page: 10 }),
        ]);

        if (cancelled) return;

        setPost(postData);

        const allPosts = Array.isArray(allPostsRes) ? allPostsRes : allPostsRes.data;
        const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
        setRelatedPosts(related);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load post';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20">
        {/* Hero skeleton */}
        <div className="relative py-20 sm:py-28 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <div className="h-4 w-24 bg-white/10 rounded mx-auto mb-8" />
            <div className="flex justify-center gap-2 mb-6">
              <div className="h-6 w-16 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="h-10 w-3/4 bg-white/10 rounded mx-auto mb-6" />
            <div className="flex justify-center gap-6">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-white/5 rounded" />
            <div className="h-8 w-1/3 bg-white/5 rounded mt-8" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {error ? 'Unable to Load Post' : 'Post Not Found'}
          </h1>
          <p className="text-slate-400 mb-6">
            {error ?? 'The article you are looking for does not exist.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      {/* Hero */}
      <div className="relative py-20 sm:py-28 bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.read_time} min read
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main content */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className="prose-content text-slate-300 leading-relaxed
                [&_h2]:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
                [&_h3]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
                [&_p]:mb-5 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5
                [&_li]:text-slate-300
                [&_strong]:text-white [&_strong]:font-semibold
                [&_code]:font-mono [&_code]:text-indigo-300 [&_code]:bg-indigo-500/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                [&_pre]:bg-gray-900 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:mb-6 [&_pre]:overflow-x-auto
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-300 [&_pre_code]:text-sm
                [&_a]:text-indigo-400 [&_a]:hover:text-indigo-300 [&_a]:transition-colors
                [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author card */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="glass border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  AC
                </div>
                <div>
                  <div className="font-bold text-white">Alex Chen</div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    Full Stack Developer & Technical Writer. Building great software and sharing learnings along the way.
                  </div>
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-8">
              <div className="text-sm text-slate-500 mb-3 uppercase tracking-wider">Share this article</div>
              <div className="flex gap-3">
                <motion.a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white hover:border-indigo-500/30 transition-colors"
                >
                  <Twitter size={14} />
                  Twitter
                </motion.a>
                <motion.a
                  href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white hover:border-indigo-500/30 transition-colors"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </motion.a>
                <motion.button
                  onClick={copyLink}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white hover:border-indigo-500/30 transition-colors"
                >
                  <Link2 size={14} />
                  Copy Link
                </motion.button>
              </div>
            </div>

            {/* Prev / Next - removed since we don't have ordered list from single-post fetch */}
            <div className="gradient-line mt-12 mb-8" />
          </motion.article>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            {/* Related posts */}
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Related Articles
              </h3>
              <div className="flex flex-col gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group"
                  >
                    <div className="flex flex-col gap-2 p-4 glass border border-white/5 rounded-xl hover:border-indigo-500/20 transition-colors">
                      <h4 className="text-sm font-medium text-slate-300 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock size={10} />
                        {related.read_time} min read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
