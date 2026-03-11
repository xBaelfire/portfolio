import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Star,
  Quote,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/admin/Toast';

interface Testimonial {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly quote: string;
  readonly rating: number;
  readonly avatar_url: string;
  readonly sort_order: number;
  readonly created_at: string;
}

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.string().min(2, 'Role must be at least 2 characters').max(100),
  company: z.string().min(2, 'Company must be at least 2 characters').max(100),
  quote: z.string().min(10, 'Quote must be at least 10 characters').max(1000),
  rating: z.coerce.number().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  avatar_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  sort_order: z.coerce.number().int().min(0).default(0),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

function StarRating({ rating }: { readonly rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-600'
          }
        />
      ))}
    </div>
  );
}

function TestimonialModal({
  testimonial,
  onClose,
  onSave,
}: {
  readonly testimonial: Testimonial | null;
  readonly onClose: () => void;
  readonly onSave: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(testimonialSchema) as any,
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          role: testimonial.role,
          company: testimonial.company,
          quote: testimonial.quote,
          rating: testimonial.rating,
          avatar_url: testimonial.avatar_url,
          sort_order: testimonial.sort_order,
        }
      : { rating: 5, sort_order: 0 },
  });

  const onSubmit = async (data: TestimonialFormData) => {
    const payload = {
      ...data,
      avatar_url: data.avatar_url ?? '',
    };

    if (testimonial) {
      await updateTestimonial(testimonial.id, payload);
    } else {
      await createTestimonial(payload);
    }
    onSave();
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
            {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name *</label>
              <input {...register('name')} placeholder="John Doe" className={inputClass} />
              {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role *</label>
              <input {...register('role')} placeholder="CEO" className={inputClass} />
              {errors.role && <p className="text-xs text-rose-400">{errors.role.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company *</label>
              <input {...register('company')} placeholder="Acme Inc." className={inputClass} />
              {errors.company && <p className="text-xs text-rose-400">{errors.company.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avatar URL</label>
              <input {...register('avatar_url')} placeholder="https://..." className={inputClass} />
              {errors.avatar_url && <p className="text-xs text-rose-400">{errors.avatar_url.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rating *</label>
              <select {...register('rating')} className={`${inputClass} cursor-pointer`}>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
              {errors.rating && <p className="text-xs text-rose-400">{errors.rating.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                {...register('sort_order')}
                placeholder="0"
                min={0}
                className={inputClass}
              />
              {errors.sort_order && <p className="text-xs text-rose-400">{errors.sort_order.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quote *</label>
              <textarea
                {...register('quote')}
                rows={4}
                placeholder="What the client said about your work..."
                className={`${inputClass} resize-none`}
              />
              {errors.quote && <p className="text-xs text-rose-400">{errors.quote.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 justify-center">
              {testimonial ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<readonly Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalTestimonial, setModalTestimonial] = useState<Testimonial | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTestimonials();
      const items = Array.isArray(res) ? res : ((res as unknown as { data: Testimonial[] }).data ?? []);
      setTestimonials(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load testimonials';
      setError(message);
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      addToast('Testimonial deleted', 'success');
    } catch {
      addToast('Failed to delete testimonial', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setModalTestimonial(null);
    addToast(
      modalTestimonial === 'new' ? 'Testimonial created' : 'Testimonial updated',
      'success',
    );
    fetchTestimonials();
  };

  const filtered = testimonials.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => a.sort_order - b.sort_order);

  const columnCount = 7;

  return (
    <AdminLayout title="Testimonials">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search testimonials..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalTestimonial('new')}
        >
          Add Testimonial
        </Button>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="admin-card flex items-center justify-between gap-4 mb-6 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
          <Button
            variant="ghost"
            leftIcon={<RefreshCw size={14} />}
            onClick={fetchTestimonials}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Role / Company</th>
                <th>Rating</th>
                <th>Quote</th>
                <th>Avatar</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: columnCount }).map((_, j) => (
                      <td key={j}>
                        <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !error && sorted.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Quote size={32} className="text-slate-700" />
                      <p>
                        {search
                          ? `No results for "${search}"`
                          : 'No testimonials yet. Add your first one!'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((testimonial) => (
                  <motion.tr
                    key={testimonial.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <td>
                      <span className="text-xs font-mono text-slate-500">
                        {testimonial.sort_order}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-white text-sm">{testimonial.name}</div>
                    </td>
                    <td>
                      <div>
                        <div className="text-sm text-slate-300">{testimonial.role}</div>
                        <div className="text-xs text-slate-500">{testimonial.company}</div>
                      </div>
                    </td>
                    <td>
                      <StarRating rating={testimonial.rating} />
                    </td>
                    <td>
                      <div className="text-xs text-slate-400 line-clamp-2 max-w-xs">
                        {testimonial.quote}
                      </div>
                    </td>
                    <td>
                      {testimonial.avatar_url ? (
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-500">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalTestimonial(testimonial)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === testimonial.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(testimonial.id)}
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
                            onClick={() => setDeleteConfirm(testimonial.id)}
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
        {sorted.length} testimonial{sorted.length !== 1 ? 's' : ''} total
      </p>

      {/* Modal */}
      <AnimatePresence>
        {modalTestimonial !== null && (
          <TestimonialModal
            testimonial={modalTestimonial === 'new' ? null : modalTestimonial}
            onClose={() => setModalTestimonial(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}
