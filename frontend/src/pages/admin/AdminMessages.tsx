import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trash2,
  Mail,
  MailOpen,
  Reply,
  Inbox,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getMessages, markMessageAsRead, deleteMessage } from '@/lib/api';
import type { ContactMessage } from '@/types';
import { formatDate, cn } from '@/lib/utils';

const SUBJECT_TRUNCATE_LENGTH = 40;

function truncateSubject(subject: string): string {
  if (subject.length <= SUBJECT_TRUNCATE_LENGTH) return subject;
  return `${subject.slice(0, SUBJECT_TRUNCATE_LENGTH)}...`;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="text-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Inbox size={40} className="text-slate-600" />
          <p className="text-slate-500 text-sm">No messages yet</p>
        </div>
      </td>
    </tr>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <tr>
      <td colSpan={5} className="text-center py-16">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle size={40} className="text-rose-400/60" />
          <p className="text-slate-400 text-sm">Failed to load messages</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </td>
    </tr>
  );
}

interface MessageRowProps {
  readonly message: ContactMessage;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly onDelete: (id: string) => void;
}

function MessageRow({ message, isExpanded, onToggle, onDelete }: MessageRowProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete message from ${message.name}?`)) {
      onDelete(message.id);
    }
  };

  const replyHref = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'group cursor-pointer transition-colors',
          !message.read && 'bg-indigo-500/[0.03]',
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            {!message.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
            )}
            <span className={cn(
              'text-sm',
              message.read ? 'text-slate-300' : 'text-white font-medium',
            )}>
              {message.name}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-slate-400">{message.email}</span>
        </td>
        <td className="px-4 py-3">
          <span className={cn(
            'text-sm',
            message.read ? 'text-slate-400' : 'text-slate-200',
          )}>
            {truncateSubject(message.subject)}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs text-slate-500">
            {formatDate(message.created_at)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <a
              href={replyHref}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              title="Reply"
            >
              <Reply size={14} />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
            <ChevronDown
              size={14}
              className={cn(
                'text-slate-600 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          </div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-white/[0.02] border-t border-b border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    {message.read ? (
                      <MailOpen size={14} className="text-slate-500" />
                    ) : (
                      <Mail size={14} className="text-indigo-400" />
                    )}
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Full Message
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                    <a
                      href={replyHref}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors"
                    >
                      <Reply size={12} />
                      Reply to {message.name}
                    </a>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export function AdminMessages() {
  const [messages, setMessages] = useState<readonly ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMessages({ per_page: 100 });
      setMessages(res.data);
    } catch {
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleExpand = useCallback(async (message: ContactMessage) => {
    const isClosing = expandedId === message.id;
    const nextId = isClosing ? null : message.id;
    setExpandedId(nextId);

    if (!isClosing && !message.read) {
      try {
        await markMessageAsRead(message.id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, read: true } : m,
          ),
        );
      } catch {
        // Silently fail for read status - non-critical
      }
    }
  }, [expandedId]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch {
      // Handle error - in production show toast notification
    }
  }, [expandedId]);

  const searchLower = search.toLowerCase();
  const filtered = useMemo(() =>
    messages.filter(
      (m) =>
        !search ||
        m.name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.subject.toLowerCase().includes(searchLower),
    ),
    [messages, search, searchLower],
  );

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages],
  );

  return (
    <AdminLayout title="Messages">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
            />
          </div>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : error ? (
                <ErrorState onRetry={fetchMessages} />
              ) : filtered.length === 0 ? (
                search ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      No results for &quot;{search}&quot;
                    </td>
                  </tr>
                ) : (
                  <EmptyState />
                )
              ) : (
                filtered.map((message) => (
                  <MessageRow
                    key={message.id}
                    message={message}
                    isExpanded={expandedId === message.id}
                    onToggle={() => handleToggleExpand(message)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <p className="text-xs text-slate-600 mt-3">
        {filtered.length} message{filtered.length !== 1 ? 's' : ''} total
      </p>
    </AdminLayout>
  );
}
