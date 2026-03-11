import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, X, ExternalLink, Github, Star } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';
import type { Project } from '@/types';
import { formatDateShort, generateSlug } from '@/lib/utils';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  long_description: z.string().optional().default(''),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  tech_stack: z.string().min(1, 'Add at least one technology'),
  github_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  live_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  category: z.enum(['web', 'mobile', 'design', 'other']),
  featured: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

function ProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProjectFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(projectSchema) as any,
    defaultValues: project
      ? {
          ...project,
          tech_stack: project.tech_stack.join(', '),
          featured: project.featured,
        }
      : { category: 'web', featured: false },
  });

  const titleValue = watch('title');

  const onSubmit = async (data: ProjectFormData) => {
    const payload = {
      ...data,
      slug: generateSlug(data.title),
      tech_stack: data.tech_stack.split(',').map((t) => t.trim()).filter(Boolean),
      featured: data.featured,
      long_description: data.long_description ?? '',
      image_url: data.image_url ?? '',
      github_url: data.github_url ?? '',
      live_url: data.live_url ?? '',
    };

    if (project) {
      await updateProject(project.id, payload);
    } else {
      await createProject(payload);
    }
    onSave();
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
        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title *</label>
              <input {...register('title')} placeholder="Project Name" className={inputClass} />
              {errors.title && <p className="text-xs text-rose-400">{errors.title.message}</p>}
              {titleValue && (
                <p className="text-xs text-slate-600">Slug: {generateSlug(titleValue)}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Short Description *</label>
              <textarea {...register('description')} rows={2} placeholder="Brief description..." className={`${inputClass} resize-none`} />
              {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tech Stack * (comma separated)</label>
              <input {...register('tech_stack')} placeholder="React, TypeScript, Node.js" className={inputClass} />
              {errors.tech_stack && <p className="text-xs text-rose-400">{errors.tech_stack.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
              <select {...register('category')} className={`${inputClass} cursor-pointer`}>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Image URL</label>
              <input {...register('image_url')} placeholder="https://..." className={inputClass} />
              {errors.image_url && <p className="text-xs text-rose-400">{errors.image_url.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">GitHub URL</label>
              <input {...register('github_url')} placeholder="https://github.com/..." className={inputClass} />
              {errors.github_url && <p className="text-xs text-rose-400">{errors.github_url.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live URL</label>
              <input {...register('live_url')} placeholder="https://..." className={inputClass} />
              {errors.live_url && <p className="text-xs text-rose-400">{errors.live_url.message}</p>}
            </div>

            <div className="flex items-center gap-3 sm:col-span-2 p-4 bg-white/5 rounded-xl">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="w-4 h-4 accent-indigo-500"
              />
              <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">
                Mark as Featured Project
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 justify-center">
              {project ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalProject, setModalProject] = useState<Project | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Handle error - in production show toast notification
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setModalProject(null);
    fetchProjects();
  };

  const filtered = projects.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Projects">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalProject('new')}
        >
          Add Project
        </Button>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Tech Stack</th>
                <th>Status</th>
                <th>Date</th>
                <th>Links</th>
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
                    {search ? `No results for "${search}"` : 'No projects yet. Add one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td>
                      <div>
                        <div className="font-medium text-white text-sm">{project.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5">{project.description}</div>
                      </div>
                    </td>
                    <td>
                      <span className="tag-pill capitalize">{project.category}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.tech_stack.slice(0, 3).map((t) => (
                          <span key={t} className="tag-pill text-xs">{t}</span>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <span className="tag-pill">+{project.tech_stack.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {project.featured ? (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400">
                          <Star size={12} className="fill-amber-400" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">
                      {formatDateShort(project.created_at)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors">
                            <Github size={14} />
                          </a>
                        )}
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalProject(project)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === project.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(project.id)}
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
                            onClick={() => setDeleteConfirm(project.id)}
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

      {/* Total count */}
      <p className="text-xs text-slate-600 mt-3">
        {filtered.length} project{filtered.length !== 1 ? 's' : ''} total
      </p>

      {/* Modal */}
      <AnimatePresence>
        {modalProject !== null && (
          <ProjectModal
            project={modalProject === 'new' ? null : modalProject}
            onClose={() => setModalProject(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
