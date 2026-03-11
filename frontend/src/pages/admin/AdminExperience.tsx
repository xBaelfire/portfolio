import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, X, ExternalLink, Briefcase, MapPin } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/admin/Toast';
import { useToast } from '@/hooks/useToast';
import { getExperience, createExperience, updateExperience, deleteExperience } from '@/lib/api';
// formatDateShort available in @/lib/utils if needed

// ===== Types =====
interface ExperienceEntry {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly start_date: string;
  readonly end_date: string | null;
  readonly is_current: boolean;
  readonly location: string;
  readonly description: string;
  readonly tech_stack: string[];
  readonly company_url: string;
  readonly sort_order: number;
  readonly created_at: string;
  readonly updated_at: string;
}

// ===== Validation =====
const experienceSchema = z.object({
  company: z.string().min(2, 'Company must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().default(''),
  is_current: z.boolean().default(false),
  location: z.string().optional().default(''),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tech_stack: z.string().optional().default(''),
  company_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  sort_order: z.coerce.number().int().min(0).default(0),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

// ===== Helpers =====
function formatMonthDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ===== Modal Component =====
function ExperienceModal({
  experience,
  onClose,
  onSave,
  addToast,
}: {
  readonly experience: ExperienceEntry | null;
  readonly onClose: () => void;
  readonly onSave: () => void;
  readonly addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ExperienceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(experienceSchema) as any,
    defaultValues: experience
      ? {
          company: experience.company,
          role: experience.role,
          start_date: experience.start_date,
          end_date: experience.end_date ?? '',
          is_current: experience.is_current,
          location: experience.location,
          description: experience.description,
          tech_stack: experience.tech_stack.join(', '),
          company_url: experience.company_url,
          sort_order: experience.sort_order,
        }
      : { is_current: false, sort_order: 0 },
  });

  const isCurrent = watch('is_current');

  const handleCurrentToggle = (checked: boolean) => {
    setValue('is_current', checked);
    if (checked) {
      setValue('end_date', '');
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      const payload = {
        company: data.company,
        role: data.role,
        start_date: data.start_date,
        end_date: data.is_current ? null : (data.end_date || null),
        is_current: data.is_current,
        location: data.location ?? '',
        description: data.description,
        tech_stack: (data.tech_stack ?? '').split(',').map((t) => t.trim()).filter(Boolean),
        company_url: data.company_url ?? '',
        sort_order: data.sort_order,
      };

      if (experience) {
        await updateExperience(experience.id, payload);
        addToast('Experience updated successfully', 'success');
      } else {
        await createExperience(payload);
        addToast('Experience created successfully', 'success');
      }
      onSave();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save experience';
      addToast(message, 'error');
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors';

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
            {experience ? 'Edit Experience' : 'Add New Experience'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company *</label>
              <input {...register('company')} placeholder="Acme Inc." className={inputClass} />
              {errors.company && <p className="text-xs text-rose-400">{errors.company.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role *</label>
              <input {...register('role')} placeholder="Senior Developer" className={inputClass} />
              {errors.role && <p className="text-xs text-rose-400">{errors.role.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Start Date *</label>
              <input type="month" {...register('start_date')} className={inputClass} />
              {errors.start_date && <p className="text-xs text-rose-400">{errors.start_date.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">End Date</label>
              <input
                type="month"
                {...register('end_date')}
                disabled={isCurrent}
                className={`${inputClass} ${isCurrent ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
              {errors.end_date && <p className="text-xs text-rose-400">{errors.end_date.message}</p>}
            </div>

            <div className="flex items-center gap-3 sm:col-span-2 p-4 bg-white/5 rounded-xl">
              <input
                type="checkbox"
                id="is_current"
                checked={isCurrent}
                onChange={(e) => handleCurrentToggle(e.target.checked)}
                className="w-4 h-4 accent-indigo-500"
              />
              <label htmlFor="is_current" className="text-sm text-slate-300 cursor-pointer">
                I currently work here
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Location</label>
              <input {...register('location')} placeholder="San Francisco, CA" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company URL</label>
              <input {...register('company_url')} placeholder="https://company.com" className={inputClass} />
              {errors.company_url && <p className="text-xs text-rose-400">{errors.company_url.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your responsibilities and achievements..."
                className={`${inputClass} resize-none`}
              />
              {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tech Stack (comma separated)</label>
              <input {...register('tech_stack')} placeholder="React, TypeScript, Node.js" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sort Order</label>
              <input type="number" {...register('sort_order')} min={0} className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 justify-center">
              {experience ? 'Save Changes' : 'Create Experience'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ===== Main Page Component =====
export function AdminExperience() {
  const [experiences, setExperiences] = useState<readonly ExperienceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalExperience, setModalExperience] = useState<ExperienceEntry | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchExperiences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getExperience();
      setExperiences(res.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load experience entries';
      setError(message);
      setExperiences([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExperience(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      addToast('Experience deleted successfully', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete experience';
      addToast(message, 'error');
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setModalExperience(null);
    fetchExperiences();
  };

  const filtered = experiences.filter(
    (e) =>
      !search ||
      e.company.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Experience">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or role..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors w-72"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalExperience('new')}
        >
          Add Experience
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
          {error}
          <button
            onClick={fetchExperiences}
            className="ml-3 underline hover:text-rose-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company & Role</th>
                <th>Dates</th>
                <th>Location</th>
                <th>Tech Stack</th>
                <th>Status</th>
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
                    {search ? `No results for "${search}"` : 'No experience entries yet. Add one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td>
                      <div>
                        <div className="font-medium text-white text-sm flex items-center gap-1.5">
                          <Briefcase size={13} className="text-indigo-400 shrink-0" />
                          {exp.company}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{exp.role}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-400">
                        {formatMonthDisplay(exp.start_date)}
                        {' - '}
                        {exp.is_current ? (
                          <span className="text-emerald-400">Present</span>
                        ) : (
                          exp.end_date ? formatMonthDisplay(exp.end_date) : 'N/A'
                        )}
                      </div>
                    </td>
                    <td>
                      {exp.location ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} className="shrink-0" />
                          {exp.location}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">--</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {exp.tech_stack.slice(0, 3).map((t) => (
                          <span key={t} className="tag-pill text-xs">{t}</span>
                        ))}
                        {exp.tech_stack.length > 3 && (
                          <span className="tag-pill">+{exp.tech_stack.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {exp.is_current ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Past</span>
                      )}
                    </td>
                    <td>
                      {exp.company_url && (
                        <a
                          href={exp.company_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalExperience(exp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === exp.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(exp.id)}
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
                            onClick={() => setDeleteConfirm(exp.id)}
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
        {filtered.length} experience entr{filtered.length !== 1 ? 'ies' : 'y'} total
      </p>

      {/* Modal */}
      <AnimatePresence>
        {modalExperience !== null && (
          <ExperienceModal
            experience={modalExperience === 'new' ? null : modalExperience}
            onClose={() => setModalExperience(null)}
            onSave={handleSave}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}
