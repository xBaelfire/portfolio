import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Layers } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { getSkills, createSkill, updateSkill, deleteSkill } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/admin/Toast';

// ===== TYPES =====

interface SkillEntry {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly proficiency: number;
  readonly category: 'frontend' | 'backend' | 'tools' | 'design';
  readonly color: string;
  readonly sort_order: number;
  readonly created_at: string;
}

// ===== CONSTANTS =====

const CATEGORIES = [
  { id: 'frontend' as const, label: 'Frontend' },
  { id: 'backend' as const, label: 'Backend' },
  { id: 'tools' as const, label: 'Tools & DevOps' },
  { id: 'design' as const, label: 'Design' },
];

const CATEGORY_LABELS: Record<SkillEntry['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools & DevOps',
  design: 'Design',
};

// ===== SCHEMA =====

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().min(1, 'Icon is required'),
  proficiency: z.coerce.number().min(0).max(100),
  category: z.enum(['frontend', 'backend', 'tools', 'design']),
  color: z.string().min(1, 'Color is required'),
  sort_order: z.coerce.number().int().min(0).default(0),
});

type SkillFormData = z.infer<typeof skillSchema>;

// ===== COMPONENTS =====

function ProficiencyBar({
  value,
  color,
}: {
  readonly value: number;
  readonly color: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{value}%</span>
    </div>
  );
}

function SkillModal({
  skill,
  onClose,
  onSave,
}: {
  readonly skill: SkillEntry | null;
  readonly onClose: () => void;
  readonly onSave: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(skillSchema) as any,
    defaultValues: skill
      ? {
          name: skill.name,
          icon: skill.icon,
          proficiency: skill.proficiency,
          category: skill.category,
          color: skill.color,
          sort_order: skill.sort_order,
        }
      : {
          category: 'frontend',
          proficiency: 50,
          color: '#6366f1',
          sort_order: 0,
          icon: '',
          name: '',
        },
  });

  const proficiencyValue = watch('proficiency');
  const colorValue = watch('color');

  const onSubmit = async (data: SkillFormData) => {
    const payload = { ...data };

    if (skill) {
      await updateSkill(skill.id, payload);
    } else {
      await createSkill(payload);
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
        className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {skill ? 'Edit Skill' : 'Add New Skill'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name *</label>
              <input {...register('name')} placeholder="React" className={inputClass} />
              {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Icon (emoji) *</label>
              <input {...register('icon')} placeholder="&#9881;" className={inputClass} />
              {errors.icon && <p className="text-xs text-rose-400">{errors.icon.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
              <select {...register('category')} className={`${inputClass} cursor-pointer`}>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
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
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Proficiency ({proficiencyValue}%)
              </label>
              <Controller
                name="proficiency"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${colorValue} 0%, ${colorValue} ${field.value}%, rgba(255,255,255,0.05) ${field.value}%, rgba(255,255,255,0.05) 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              />
              {errors.proficiency && <p className="text-xs text-rose-400">{errors.proficiency.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  {...register('color')}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  {...register('color')}
                  placeholder="#6366f1"
                  className={`${inputClass} flex-1`}
                />
                <div
                  className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
                  style={{ backgroundColor: colorValue }}
                />
              </div>
              {errors.color && <p className="text-xs text-rose-400">{errors.color.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 justify-center">
              {skill ? 'Save Changes' : 'Create Skill'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SkillCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/5 rounded w-24" />
        <div className="h-2 bg-white/5 rounded w-full" />
      </div>
      <div className="w-8 h-4 bg-white/5 rounded" />
    </div>
  );
}

// ===== MAIN COMPONENT =====

export function AdminSkills() {
  const [skills, setSkills] = useState<readonly SkillEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SkillEntry['category']>('frontend');
  const [modalSkill, setModalSkill] = useState<SkillEntry | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSkills();
      const items = Array.isArray(res) ? res : ((res as unknown as { data: SkillEntry[] }).data ?? []);
      setSkills(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load skills';
      setError(message);
      setSkills([]);
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      addToast('Skill deleted successfully', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete skill';
      addToast(message, 'error');
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    setModalSkill(null);
    fetchSkills();
    addToast(
      modalSkill === 'new' ? 'Skill created successfully' : 'Skill updated successfully',
      'success',
    );
  };

  const filteredSkills = skills
    .filter((s) => s.category === activeTab)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminLayout title="Skills">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers size={18} />
          <span className="text-sm">
            {skills.length} skill{skills.length !== 1 ? 's' : ''} across {CATEGORIES.length} categories
          </span>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalSkill('new')}
        >
          Add Skill
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5 mb-6 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const count = skills.filter((s) => s.category === cat.id).length;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                relative flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
              `}
            >
              {cat.label}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="admin-card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-rose-400 text-sm mb-3">{error}</p>
          <Button variant="ghost" onClick={fetchSkills}>
            Retry
          </Button>
        </div>
      )}

      {/* Skills List */}
      {!error && (
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkillCardSkeleton key={i} />)
          ) : filteredSkills.length === 0 ? (
            <div className="admin-card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Layers size={20} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm mb-1">
                No {CATEGORY_LABELS[activeTab]} skills yet
              </p>
              <p className="text-slate-600 text-xs mb-4">
                Add your first skill in this category
              </p>
              <Button
                variant="ghost"
                leftIcon={<Plus size={14} />}
                onClick={() => setModalSkill('new')}
              >
                Add Skill
              </Button>
            </div>
          ) : (
            filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${skill.color}15` }}
                >
                  {skill.icon}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{skill.name}</div>
                  <ProficiencyBar value={skill.proficiency} color={skill.color} />
                </div>

                {/* Color Swatch */}
                <div
                  className="w-5 h-5 rounded-md border border-white/10 shrink-0"
                  style={{ backgroundColor: skill.color }}
                  title={skill.color}
                />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModalSkill(skill)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  {deleteConfirm === skill.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(skill.id)}
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
                      onClick={() => setDeleteConfirm(skill.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Category count */}
      {!error && !isLoading && (
        <p className="text-xs text-slate-600 mt-3">
          {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} in{' '}
          {CATEGORY_LABELS[activeTab]}
        </p>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalSkill !== null && (
          <SkillModal
            skill={modalSkill === 'new' ? null : modalSkill}
            onClose={() => setModalSkill(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}
