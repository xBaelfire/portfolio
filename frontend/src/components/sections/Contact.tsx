import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MapPin, Clock, Github, Linkedin, Twitter, Send, CheckCircle2, XCircle } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { sendContactMessage, getSettings } from '@/lib/api';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_EMAIL = 'hello@alexchen.dev';
const DEFAULT_LOCATION = 'San Francisco, CA';
const DEFAULT_HOURS = 'Mon\u2013Fri, 9AM\u20136PM PST';
const DEFAULT_AVAILABILITY_TEXT = 'Open to freelance & full-time';
const DEFAULT_SOCIAL = {
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
};

function buildContactInfo(settings: Record<string, string>) {
  const email = settings.contact_email || DEFAULT_EMAIL;
  return [
    {
      icon: Mail,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: settings.contact_location || DEFAULT_LOCATION,
      href: null as string | null,
    },
    {
      icon: Clock,
      label: 'Availability',
      value: settings.contact_hours || DEFAULT_HOURS,
      href: null as string | null,
    },
  ];
}

function buildSocialLinks(settings: Record<string, string>) {
  return [
    { icon: Github, href: settings.social_github || DEFAULT_SOCIAL.github, label: 'GitHub' },
    { icon: Linkedin, href: settings.social_linkedin || DEFAULT_SOCIAL.linkedin, label: 'LinkedIn' },
    { icon: Twitter, href: settings.social_twitter || DEFAULT_SOCIAL.twitter, label: 'Twitter' },
  ];
}

function InputField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <XCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
          setSettingsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSettingsLoaded(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const contactInfo = buildContactInfo(settings);
  const socialLinks = buildSocialLinks(settings);
  const availabilityStatus = settings.availability_status || 'Available for Work';
  const availabilityText = settings.availability_text || DEFAULT_AVAILABILITY_TEXT;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await sendContactMessage(data);
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200';

  return (
    <section
      id="contact"
      className="section relative bg-gray-900/20"
      style={{ opacity: settingsLoaded ? 1 : 0.6, transition: 'opacity 0.4s ease-in-out' }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          number="07"
          label="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? I'd love to hear about it."
          align="center"
          className="mb-16"
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12"
        >
          {/* Left: Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Availability badge */}
            <div className="flex items-center gap-3 p-4 glass border border-green-500/20 rounded-2xl">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <div className="text-sm font-semibold text-white">{availabilityStatus}</div>
                <div className="text-xs text-slate-400">{availabilityText}</div>
              </div>
            </div>

            {/* Contact info list */}
            <div className="flex flex-col gap-4">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
                    {href ? (
                      <a href={href} className="text-sm text-white hover:text-indigo-400 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <div className="text-sm text-white">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Find Me Online</div>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 transition-colors"
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="lg:col-span-3">
            <div className="glass border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle2 size={60} className="text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                  <p className="text-slate-400 max-w-xs">
                    Thank you for reaching out. I'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Your Name" error={errors.name?.message}>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="John Doe"
                        className={cn(inputClass, errors.name && 'border-rose-500/50')}
                      />
                    </InputField>

                    <InputField label="Email Address" error={errors.email?.message}>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className={cn(inputClass, errors.email && 'border-rose-500/50')}
                      />
                    </InputField>
                  </div>

                  <InputField label="Subject" error={errors.subject?.message}>
                    <input
                      {...register('subject')}
                      type="text"
                      placeholder="Project Inquiry"
                      className={cn(inputClass, errors.subject && 'border-rose-500/50')}
                    />
                  </InputField>

                  <InputField label="Message" error={errors.message?.message}>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Tell me about your project..."
                      className={cn(inputClass, 'resize-none', errors.message && 'border-rose-500/50')}
                    />
                  </InputField>

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400"
                    >
                      <XCircle size={16} />
                      {errorMessage}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={status === 'loading'}
                    rightIcon={<Send size={16} />}
                    className="justify-center"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
