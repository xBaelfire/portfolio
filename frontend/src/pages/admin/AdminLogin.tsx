import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { login } from '@/lib/api';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    try {
      const result = await login(data.email, data.password);
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_user', JSON.stringify({ email: result.email }));
      navigate('/admin/dashboard');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-600 text-sm',
      'focus:outline-none focus:bg-indigo-500/5 transition-all duration-200',
      hasError
        ? 'border-rose-500/50 focus:border-rose-500/80'
        : 'border-white/10 focus:border-indigo-500/50'
    );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
              <span className="text-white text-2xl font-extrabold">A</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to manage your portfolio</p>
          </div>

          {/* Error alert */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400"
            >
              <AlertCircle size={16} className="shrink-0" />
              {loginError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(inputClass(!!errors.password), 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<LogIn size={16} />}
              className="justify-center mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Protected area. Unauthorized access is prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
