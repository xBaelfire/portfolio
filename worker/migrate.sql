-- Portfolio DB Migration: Fresh schema for new portfolio project
-- This drops old conflicting tables and recreates with new schema

DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS blog_posts;

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  tech_stack TEXT,
  github_url TEXT,
  live_url TEXT,
  featured INTEGER DEFAULT 0,
  category TEXT DEFAULT 'web',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  tags TEXT,
  published INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Seed data
INSERT OR IGNORE INTO projects (id, title, slug, description, long_description, tech_stack, category, featured, created_at, updated_at) VALUES
  ('p1', 'E-Commerce Platform', 'ecommerce-platform', 'Full-stack e-commerce solution with real-time inventory, Stripe payments, and admin dashboard.', '<p>A complete e-commerce platform built for modern businesses. Features real-time inventory management, secure payments via Stripe, and a powerful admin panel.</p>', '["React","Node.js","PostgreSQL","Stripe","Redis"]', 'web', 1, datetime(''now''), datetime(''now'')),
  ('p2', 'AI Analytics Dashboard', 'ai-dashboard', 'Real-time data visualization dashboard powered by machine learning insights.', '<p>An enterprise analytics platform combining real-time data streaming with ML-powered predictions and beautiful D3.js visualizations.</p>', '["Next.js","Python","TensorFlow","D3.js","AWS"]', 'web', 1, datetime(''now''), datetime(''now'')),
  ('p3', 'FinTech Mobile App', 'mobile-fintech', 'Cross-platform mobile banking app with biometric auth and instant transfers.', '<p>A secure mobile banking application with biometric authentication and real-time transfer capabilities.</p>', '["React Native","TypeScript","Plaid API","Expo"]', 'mobile', 0, datetime(''now''), datetime(''now''));

INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, tags, published, read_time, views, created_at, updated_at) VALUES
  ('b1', 'Building Scalable React Applications in 2025', 'building-scalable-react-apps', 'Best practices for structuring large React codebases, state management patterns, and performance optimization.', '<p>React has come a long way. In 2025, building scalable apps requires careful architecture decisions.</p>', '["React","TypeScript","Architecture"]', 1, 8, 1250, datetime(''now''), datetime(''now'')),
  ('b2', 'The Complete Guide to Cloudflare Workers', 'cloudflare-workers-guide', 'Everything you need to know about deploying serverless applications at the edge.', '<p>Cloudflare Workers provide an incredible platform for running serverless code at the edge.</p>', '["Cloudflare","Serverless","Edge Computing"]', 1, 12, 890, datetime(''now''), datetime(''now''));
