import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink, ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getProject, getProjects } from '@/lib/api';
import type { Project } from '@/types';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [prevProject, setPrevProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [projectData, allProjectsRes] = await Promise.all([
          getProject(id ?? ''),
          getProjects(),
        ]);

        if (cancelled) return;

        setProject(projectData);

        const allProjects = Array.isArray(allProjectsRes) ? allProjectsRes : allProjectsRes.data;
        const currentIndex = allProjects.findIndex((p) => p.id === projectData.id || p.slug === projectData.slug);
        setPrevProject(currentIndex > 0 ? allProjects[currentIndex - 1] : null);
        setNextProject(currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load project';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        {/* Hero skeleton */}
        <div className="relative h-64 sm:h-96 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-72 bg-white/10 rounded" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
          <div className="flex justify-between items-center mb-10 pb-8 border-b border-white/5">
            <div className="h-6 w-20 bg-white/5 rounded-full" />
            <div className="flex gap-3">
              <div className="h-9 w-24 bg-white/5 rounded-lg" />
              <div className="h-9 w-24 bg-white/5 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-full bg-white/5 rounded" />
            <div className="h-5 w-5/6 bg-white/5 rounded" />
            <div className="h-5 w-4/6 bg-white/5 rounded" />
            <div className="h-8 w-1/4 bg-white/5 rounded mt-8" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {error ? 'Unable to Load Project' : 'Project Not Found'}
          </h1>
          <p className="text-slate-400 mb-6">
            {error ?? 'The project you are looking for does not exist.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-extrabold text-white text-center px-4"
          >
            {project.title}
          </motion.h1>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6"
        >
          <Link
            to="/#projects"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm glass border border-white/10 px-3 py-2 rounded-lg"
          >
            <ChevronLeft size={16} />
            Back to Projects
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Project meta & links */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5">
            <div>
              <span className="tag-pill capitalize">{project.category}</span>
              {project.featured && (
                <span className="ml-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {project.github_url && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Github size={14} />}
                  onClick={() => window.open(project.github_url, '_blank')}
                >
                  GitHub
                </Button>
              )}
              {project.live_url && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<ExternalLink size={14} />}
                  onClick={() => window.open(project.live_url, '_blank')}
                >
                  Live Demo
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-indigo max-w-none mb-10">
            <p className="text-lg text-slate-300 leading-relaxed mb-6">{project.description}</p>
            {project.long_description && (
              <div
                className="text-slate-400 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: project.long_description }}
              />
            )}
          </div>

          {/* Tech stack */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 glass border border-indigo-500/20 rounded-xl text-sm text-indigo-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="gradient-line mb-8" />
          <div className="flex items-center justify-between gap-4">
            {prevProject ? (
              <Link
                to={`/projects/${prevProject.id}`}
                className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Previous</div>
                  <div className="text-sm font-medium">{prevProject.title}</div>
                </div>
              </Link>
            ) : <div />}

            {nextProject ? (
              <Link
                to={`/projects/${nextProject.id}`}
                className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors text-right"
              >
                <div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Next</div>
                  <div className="text-sm font-medium">{nextProject.title}</div>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
