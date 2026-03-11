import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { Toast as ToastData } from '@/hooks/useToast';

interface ToastContainerProps {
  readonly toasts: readonly ToastData[];
  readonly removeToast: (id: string) => void;
}

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const COLOR_MAP = {
  success: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    icon: 'text-green-400',
    text: 'text-green-200',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    text: 'text-red-200',
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    text: 'text-blue-200',
  },
} as const;

function ToastItem({
  toast,
  onDismiss,
}: {
  readonly toast: ToastData;
  readonly onDismiss: () => void;
}) {
  const Icon = ICON_MAP[toast.type];
  const colors = COLOR_MAP[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
        ${colors.border} ${colors.bg} bg-white/5 shadow-lg
        min-w-[280px] max-w-[400px]
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 ${colors.icon}`} />
      <span className={`text-sm flex-1 ${colors.text}`}>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-md text-white/40 hover:text-white/80
                   hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
