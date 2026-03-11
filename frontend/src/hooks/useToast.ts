import { useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
}

const AUTO_DISMISS_MS = 4000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = generateId();
      const toast: Toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);

      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, addToast, removeToast } as const;
}
