import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, X, Eye, Globe, Lock } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ToastContainer } from '@/components/admin/Toast';
import { useToast } from '@/hooks/useToast';
import { getPosts, createPost, updatePost, deletePost } from '@/lib/api';
import type { BlogPost } from '@/types';
import { formatDateShort, generateSlug, calculateReadTime } from '@/lib/utils';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
  cover_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  tags: z.string().min(1, 'Add at least one tag'),
  published: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

function PostModal({
  post,
  onClose,
  onSave,
  onError,
}: {
  post: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
  onError: (msg: string) => void;
}) {
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema) as any,
    defaultValues: post
      ? {
          ...post,
          tags: post.tags.join(', '),
          published: post.published,
        }
      : { published: false },
  });

  const titleValue = watch('title');
  const contentValue = watch('content') ?? '';

  const onSubmit = async (data: PostFormData) => {
    const slug = generateSlug(data.title);
    const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const read_time = calculateReadTime(data.content);

    const payload = {
      ...data,
      slug,
      tags,
      read_time,
      cover_url: coverUrl,
    };

    try {
      if (post) {
        await updatePost(post.id, payload);
      } else {
        await createPost(payload);
      }
      onSave();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save post');
    }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {post ? 'Edit Post' : 'Write New Post'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title *</label>
            <input {...register('title')} placeholder="Post Title" className={inputClass} />
            {errors.title && <p className="text-xs text-rose-400">{errors.title.message}</p>}
            {titleValue && (
              <p className="text-xs text-slate-600">Slug: {generateSlug(titleValue)}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Excerpt *</label>
            <textarea {...register('excerpt')} rows={2} placeholder="Brief summary..." className={`${inputClass} resize-none`} />
            {errors.excerpt && <p className="text-xs text-rose-400">{errors.excerpt.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Content * (HTML supported)
              {contentValue && (
                <span className="ml-2 text-indigo-400 normal-case font-normal">
                  ~{calculateReadTime(contentValue)} min read
                </span>
              )}
            </label>
            <textarea
              {...register('content')}
              rows={12}
              placeholder="<p>Write your post content here...</p>"
              className={`${inputClass} resize-none font-mono text-xs`}
            />
            {errors.content && <p className="text-xs text-rose-400">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tags * (comma separated)</label>
              <input {...register('tags')} placeholder="React, TypeScript, Tutorial" className={inputClass} />
              {errors.tags && <p className="text-xs text-rose-400">{errors.tags.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <ImageUploader
                value={coverUrl}
                onChange={setCoverUrl}
                label="Cover Image"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="w-4 h-4 accent-indigo-500"
            />
            <label htmlFor="published" className="text-sm text-slate-300 cursor-pointer">
              Publish immediately (make visible to public)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 justify-center">
              {post ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function AdminPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalPost, setModalPost] = useState<BlogPost | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load posts';
      addToast(message, 'error');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      addToast('Post deleted', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete post', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setModalPost(null);
    addToast(modalPost === 'new' ? 'Post created' : 'Post updated', 'success');
    fetchPosts();
  };

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout title="Blog Posts">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalPost('new')}
        >
          Write Post
        </Button>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Views</th>
                <th>Read Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {search ? `No results for "${search}"` : 'No posts yet. Write your first one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td>
                      <div>
                        <div className="font-medium text-white text-sm">{post.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                          /{post.slug}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {post.tags.slice(0, 2).map((t) => (
                          <span key={t} className="tag-pill">{t}</span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="tag-pill">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {post.published ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-400">
                          <Globe size={12} /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Lock size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye size={11} /> {post.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{post.read_time} min</td>
                    <td className="text-xs text-slate-500">{formatDateShort(post.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalPost(post)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === post.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="px-2 py-1 text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 text-slate-500 hover:text-white transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-3">
        {filtered.length} post{filtered.length !== 1 ? 's' : ''} total
      </p>

      {/* Modal */}
      <AnimatePresence>
        {modalPost !== null && (
          <PostModal
            post={modalPost === 'new' ? null : modalPost}
            onClose={() => setModalPost(null)}
            onSave={handleSave}
            onError={(msg) => addToast(msg, 'error')}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
