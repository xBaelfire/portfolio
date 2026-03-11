import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const ALL_POSTS = [
  {
    id: '1',
    slug: 'building-scalable-react-apps',
    title: 'Building Scalable React Applications in 2025',
    excerpt: 'Best practices for structuring large React codebases, state management patterns, and performance optimization techniques.',
    content: `
      <p>React has come a long way since its introduction. In 2025, building scalable applications requires
      a combination of architectural decisions, performance awareness, and developer experience considerations.</p>

      <h2>1. Project Structure</h2>
      <p>A well-organized project structure is the foundation of a scalable React application.
      Rather than organizing by file type (components, hooks, utils), consider organizing by feature or domain.</p>

      <pre><code>src/
  features/
    auth/
      components/
      hooks/
      store/
      types.ts
    products/
      components/
      hooks/
      api.ts
  shared/
    components/
    hooks/
    utils/
  app/
    routes.tsx
    App.tsx</code></pre>

      <h2>2. State Management</h2>
      <p>Not every piece of state belongs in a global store. Consider the following hierarchy:</p>
      <ul>
        <li><strong>Local state</strong>: useState, useReducer for component-specific state</li>
        <li><strong>Server state</strong>: TanStack Query for remote data fetching and caching</li>
        <li><strong>Global state</strong>: Zustand or Redux Toolkit for app-wide shared state</li>
        <li><strong>URL state</strong>: React Router for navigation and filter state</li>
      </ul>

      <h2>3. Performance Optimization</h2>
      <p>Performance is not an afterthought — it should be built into your development process from day one.
      Key techniques include code splitting with React.lazy, memoization with useMemo and useCallback,
      and virtualization for long lists with TanStack Virtual.</p>

      <h2>4. TypeScript Best Practices</h2>
      <p>TypeScript is not optional in 2025. Use strict mode, avoid <code>any</code>, and leverage
      discriminated unions for complex state machines.</p>

      <h2>Conclusion</h2>
      <p>Building scalable React applications requires intentional architecture decisions.
      Start simple, add complexity only when needed, and always keep the developer experience in mind.</p>
    `,
    tags: ['React', 'TypeScript', 'Architecture'],
    created_at: '2025-03-01',
    read_time: 8,
    gradient: 'from-indigo-900 to-purple-900',
  },
  {
    id: '2',
    slug: 'cloudflare-workers-guide',
    title: 'The Complete Guide to Cloudflare Workers',
    excerpt: 'Everything you need to know about deploying serverless applications at the edge.',
    content: `<p>Cloudflare Workers provide an incredible platform for running serverless code at the edge, closest to your users.</p>
    <h2>Getting Started</h2><p>Workers use the V8 JavaScript engine with a Web API-compatible runtime...</p>`,
    tags: ['Cloudflare', 'Serverless', 'Edge Computing'],
    created_at: '2025-02-15',
    read_time: 12,
    gradient: 'from-cyan-900 to-blue-900',
  },
];

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = ALL_POSTS.find((p) => p.slug === slug);
  const currentIndex = post ? ALL_POSTS.indexOf(post) : -1;
  const relatedPosts = ALL_POSTS.filter((p) => p.slug !== slug).slice(0, 3);
  const prevPost = currentIndex > 0 ? ALL_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < ALL_POSTS.length - 1 ? ALL_POSTS[currentIndex + 1] : null;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <Button variant="primary" onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      {/* Hero */}
      <div className={`relative py-20 sm:py-28 bg-gradient-to-br ${post.gradient}`}>
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

            {/* Prev / Next */}
            <div className="gradient-line mt-12 mb-8" />
            <div className="flex items-center justify-between gap-4">
              {prevPost ? (
                <Link to={`/blog/${prevPost.slug}`} className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <div>
                    <div className="text-xs text-slate-600 uppercase">Previous</div>
                    <div className="text-sm font-medium line-clamp-1">{prevPost.title}</div>
                  </div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors text-right">
                  <div>
                    <div className="text-xs text-slate-600 uppercase">Next</div>
                    <div className="text-sm font-medium line-clamp-1">{nextPost.title}</div>
                  </div>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : <div />}
            </div>
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
