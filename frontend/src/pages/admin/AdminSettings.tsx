import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, FileText, Mail, Share2, BarChart3, File } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/admin/Toast';
import { useToast } from '@/hooks/useToast';
import { getSettings, updateSettings } from '@/lib/api';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors';

const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;

const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`;

const LABEL_CLASS = 'text-xs font-medium text-slate-400 uppercase tracking-wider';

interface PersonalInfoForm {
  readonly site_name: string;
  readonly site_title: string;
  readonly site_tagline: string;
  readonly avatar_url: string;
}

interface AboutForm {
  readonly about_bio: string;
  readonly about_highlights: string;
  readonly availability_status: string;
  readonly availability_text: string;
}

interface ContactInfoForm {
  readonly contact_email: string;
  readonly contact_location: string;
  readonly contact_availability_hours: string;
}

interface SocialLinksForm {
  readonly social_github: string;
  readonly social_linkedin: string;
  readonly social_twitter: string;
}

interface StatsForm {
  readonly stat_years_experience: string;
  readonly stat_projects_completed: string;
  readonly stat_happy_clients: string;
}

interface ResumeForm {
  readonly resume_url: string;
}

function SettingsCard({
  title,
  icon: Icon,
  children,
}: {
  readonly title: string;
  readonly icon: React.ElementType;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="admin-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Icon size={16} className="text-indigo-400" />
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  readonly label: string;
  readonly error?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={LABEL_CLASS}>{label}</label>
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-1.5">
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonalInfoSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoForm>({
    defaultValues: {
      site_name: settings.site_name ?? 'Alex Chen',
      site_title: settings.site_title ?? '',
      site_tagline: settings.site_tagline ?? '',
      avatar_url: settings.avatar_url ?? '',
    },
  });

  const onSubmit = (data: PersonalInfoForm) => onSave({ ...data });

  return (
    <SettingsCard title="Personal Info" icon={User}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Site Name" error={errors.site_name?.message}>
            <input
              {...register('site_name', { required: 'Site name is required' })}
              placeholder="Alex Chen"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Site Title" error={errors.site_title?.message}>
            <input
              {...register('site_title')}
              placeholder="Full Stack Developer"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
        <FormField label="Tagline" error={errors.site_tagline?.message}>
          <textarea
            {...register('site_tagline')}
            rows={3}
            placeholder="Your hero tagline..."
            className={TEXTAREA_CLASS}
          />
        </FormField>
        <FormField label="Avatar URL" error={errors.avatar_url?.message}>
          <input
            {...register('avatar_url')}
            placeholder="https://example.com/avatar.jpg"
            className={INPUT_CLASS}
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save Personal Info
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function AboutSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AboutForm>({
    defaultValues: {
      about_bio: settings.about_bio ?? '',
      about_highlights: settings.about_highlights ?? '',
      availability_status: settings.availability_status ?? 'available',
      availability_text: settings.availability_text ?? '',
    },
  });

  const onSubmit = (data: AboutForm) => onSave({ ...data });

  return (
    <SettingsCard title="About" icon={FileText}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Bio" error={errors.about_bio?.message}>
          <textarea
            {...register('about_bio')}
            rows={5}
            placeholder="Your main bio text..."
            className={TEXTAREA_CLASS}
          />
        </FormField>
        <FormField label="Highlights (comma-separated)" error={errors.about_highlights?.message}>
          <input
            {...register('about_highlights')}
            placeholder="React & TypeScript,Node.js,Cloud Architecture"
            className={INPUT_CLASS}
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Availability Status" error={errors.availability_status?.message}>
            <select {...register('availability_status')} className={SELECT_CLASS}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </FormField>
          <FormField label="Availability Text" error={errors.availability_text?.message}>
            <input
              {...register('availability_text')}
              placeholder="Open to freelance & full-time"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save About
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function ContactInfoSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInfoForm>({
    defaultValues: {
      contact_email: settings.contact_email ?? '',
      contact_location: settings.contact_location ?? '',
      contact_availability_hours: settings.contact_availability_hours ?? '',
    },
  });

  const onSubmit = (data: ContactInfoForm) => onSave({ ...data });

  return (
    <SettingsCard title="Contact Info" icon={Mail}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email" error={errors.contact_email?.message}>
            <input
              type="email"
              {...register('contact_email')}
              placeholder="hello@example.com"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Location" error={errors.contact_location?.message}>
            <input
              {...register('contact_location')}
              placeholder="San Francisco, CA"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
        <FormField label="Availability Hours" error={errors.contact_availability_hours?.message}>
          <input
            {...register('contact_availability_hours')}
            placeholder="Mon-Fri, 9AM-6PM PST"
            className={INPUT_CLASS}
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save Contact Info
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function SocialLinksSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SocialLinksForm>({
    defaultValues: {
      social_github: settings.social_github ?? '',
      social_linkedin: settings.social_linkedin ?? '',
      social_twitter: settings.social_twitter ?? '',
    },
  });

  const onSubmit = (data: SocialLinksForm) => onSave({ ...data });

  return (
    <SettingsCard title="Social Links" icon={Share2}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="GitHub URL" error={errors.social_github?.message}>
          <input
            type="url"
            {...register('social_github')}
            placeholder="https://github.com/username"
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="LinkedIn URL" error={errors.social_linkedin?.message}>
          <input
            type="url"
            {...register('social_linkedin')}
            placeholder="https://linkedin.com/in/username"
            className={INPUT_CLASS}
          />
        </FormField>
        <FormField label="Twitter URL" error={errors.social_twitter?.message}>
          <input
            type="url"
            {...register('social_twitter')}
            placeholder="https://twitter.com/username"
            className={INPUT_CLASS}
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save Social Links
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function StatsSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StatsForm>({
    defaultValues: {
      stat_years_experience: settings.stat_years_experience ?? '',
      stat_projects_completed: settings.stat_projects_completed ?? '',
      stat_happy_clients: settings.stat_happy_clients ?? '',
    },
  });

  const onSubmit = (data: StatsForm) => onSave({ ...data });

  return (
    <SettingsCard title="Stats" icon={BarChart3}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Years of Experience" error={errors.stat_years_experience?.message}>
            <input
              {...register('stat_years_experience')}
              placeholder="5+"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Projects Completed" error={errors.stat_projects_completed?.message}>
            <input
              {...register('stat_projects_completed')}
              placeholder="50+"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Happy Clients" error={errors.stat_happy_clients?.message}>
            <input
              {...register('stat_happy_clients')}
              placeholder="30+"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save Stats
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function ResumeSection({
  settings,
  onSave,
}: {
  readonly settings: Record<string, string>;
  readonly onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResumeForm>({
    defaultValues: {
      resume_url: settings.resume_url ?? '',
    },
  });

  const onSubmit = (data: ResumeForm) => onSave({ ...data });

  return (
    <SettingsCard title="Resume" icon={File}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Resume PDF URL" error={errors.resume_url?.message}>
          <input
            {...register('resume_url')}
            placeholder="https://example.com/resume.pdf"
            className={INPUT_CLASS}
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Save size={14} />}>
            Save Resume
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch {
      addToast('Failed to load settings', 'error');
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSection = useCallback(
    async (data: Record<string, string>) => {
      try {
        await updateSettings(data);
        setSettings((prev) => ({ ...prev, ...data }));
        addToast('Settings saved successfully', 'success');
      } catch {
        addToast('Failed to save settings', 'error');
      }
    },
    [addToast],
  );

  return (
    <AdminLayout title="Site Settings">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">
          <PersonalInfoSection settings={settings} onSave={handleSaveSection} />
          <AboutSection settings={settings} onSave={handleSaveSection} />
          <ContactInfoSection settings={settings} onSave={handleSaveSection} />
          <SocialLinksSection settings={settings} onSave={handleSaveSection} />
          <StatsSection settings={settings} onSave={handleSaveSection} />
          <ResumeSection settings={settings} onSave={handleSaveSection} />
        </div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}
