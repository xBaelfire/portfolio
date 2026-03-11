import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, ArrowUp } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
];

const navLinks = [
  { label: 'About', sectionId: 'about' },
  { label: 'Skills', sectionId: 'skills' },
  { label: 'Projects', sectionId: 'projects' },
  { label: 'Blog', sectionId: 'blog-preview' },
  { label: 'Contact', sectionId: 'contact' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-gray-950 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-10"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1 font-extrabold text-2xl">
              <span className="text-white">Alex</span>
              <span className="text-indigo-500">.</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Full Stack Developer crafting beautiful digital experiences with modern technologies.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map(({ label, sectionId }) => (
                <li key={sectionId}>
                  <motion.button
                    onClick={() => scrollToSection(sectionId)}
                    whileHover={{ x: 4 }}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Get In Touch
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:hello@example.com"
                  className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Mail size={14} className="text-indigo-500" />
                  hello@example.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-400 text-sm">Available for freelance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="gradient-line mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} Alex. Built with React, TypeScript & Tailwind.
          </p>

          {/* Back to top */}
          <motion.button
            onClick={() => scrollToSection('hero')}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/30 text-sm transition-colors group"
          >
            <ArrowUp size={14} className="group-hover:text-indigo-400 transition-colors" />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
