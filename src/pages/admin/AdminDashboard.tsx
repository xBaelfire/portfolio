import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, FileText, MessageSquare, Eye, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getStats } from '@/lib/api';
import type { DashboardStats } from '@/types';
import { formatNumber } from '@/lib/utils';

const FALLBACK_STATS: DashboardStats = {
  total_projects: 0,
  total_posts: 0,
  total_messages: 0,
  unread_messages: 0,
  total_views: 0,
  featured_projects: 0,
};

const quickActions = [
  { label: 'New Project', href: '/admin/projects', icon: FolderKanban, color: 'from-indigo-500 to-purple-600' },
  { label: 'New Post', href: '/admin/posts', icon: FileText, color: 'from-cyan-500 to-blue-600' },
];

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="admin-card hover:border-indigo-500/20 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        <TrendingUp size={14} className="text-green-400 opacity-70" />
      </div>
      <div className="text-2xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {subtext && <div className="text-xs text-slate-600 mt-1">{subtext}</div>}
    </motion.div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    {
      icon: FolderKanban,
      label: 'Total Projects',
      value: isLoading ? '—' : stats.total_projects,
      subtext: `${stats.featured_projects} featured`,
      color: 'from-indigo-500 to-purple-600',
      delay: 0.1,
    },
    {
      icon: FileText,
      label: 'Blog Posts',
      value: isLoading ? '—' : stats.total_posts,
      color: 'from-cyan-500 to-blue-600',
      delay: 0.15,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: isLoading ? '—' : stats.total_messages,
      subtext: stats.unread_messages > 0 ? `${stats.unread_messages} unread` : 'All read',
      color: 'from-emerald-500 to-teal-600',
      delay: 0.2,
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: isLoading ? '—' : formatNumber(stats.total_views),
      color: 'from-orange-500 to-amber-600',
      delay: 0.25,
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white">Welcome back, Admin</h2>
        <p className="text-slate-400 mt-1">Here's an overview of your portfolio.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} to={href}>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-5 py-3 glass border border-white/5 rounded-xl hover:border-indigo-500/20 transition-colors group"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {label}
                </span>
                <Plus size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors ml-1" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent activity placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="admin-card">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p>No recent activity to show.</p>
              <p className="text-xs mt-1">Start by adding projects or blog posts.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
