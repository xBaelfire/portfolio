// ===== PROJECT TYPES =====
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  image_url: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  featured: boolean;
  category: 'web' | 'mobile' | 'design' | 'other';
  created_at: string;
  updated_at: string;
}

// ===== BLOG TYPES =====
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  tags: string[];
  published: boolean;
  read_time: number;
  views: number;
  created_at: string;
  updated_at: string;
}

// ===== SKILL TYPES =====
export interface Skill {
  name: string;
  icon: string;
  proficiency: number;
  category: 'frontend' | 'backend' | 'tools' | 'design';
  color?: string;
}

export interface SkillCategory {
  id: 'frontend' | 'backend' | 'tools' | 'design';
  label: string;
  skills: Skill[];
}

// ===== EXPERIENCE TYPES =====
export interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
  tech_stack: string[];
  company_url?: string;
  logo_url?: string;
  location: string;
  is_current: boolean;
}

// ===== TESTIMONIAL TYPES =====
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar_url?: string;
  quote: string;
  rating: number;
}

// ===== CONTACT TYPES =====
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactForm {
  id: string;
  read: boolean;
  created_at: string;
}

// ===== ADMIN TYPES =====
export interface AdminUser {
  email: string;
  token: string;
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ===== STATS TYPES =====
export interface DashboardStats {
  total_projects: number;
  total_posts: number;
  total_messages: number;
  unread_messages: number;
  total_views: number;
  featured_projects: number;
}

// ===== UPLOAD TYPES =====
export interface UploadResponse {
  url: string;
  key: string;
}

// ===== FILTER TYPES =====
export type ProjectCategory = 'all' | 'web' | 'mobile' | 'design';
export type PostCategory = 'all' | string;

// ===== NAV TYPES =====
export interface NavItem {
  label: string;
  href: string;
  sectionId?: string;
}
