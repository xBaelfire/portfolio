import { apiRequest } from './utils';
import type {
  Project,
  BlogPost,
  ContactForm,
  ContactMessage,
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  UploadResponse,
  AdminUser,
} from '@/types';

// ===== PROJECTS API =====
export async function getProjects(params?: {
  category?: string;
  featured?: boolean;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Project>> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.featured !== undefined) query.set('featured', String(params.featured));
  if (params?.page) query.set('page', String(params.page));
  if (params?.per_page) query.set('per_page', String(params.per_page));
  const qs = query.toString();
  return apiRequest<PaginatedResponse<Project>>(`/api/projects${qs ? `?${qs}` : ''}`);
}

export async function getProject(id: string): Promise<Project> {
  return apiRequest<Project>(`/api/projects/${id}`);
}

export async function createProject(
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Project>> {
  return apiRequest<ApiResponse<Project>>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<Project>> {
  return apiRequest<ApiResponse<Project>>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

// ===== BLOG POSTS API =====
export async function getPosts(params?: {
  tag?: string;
  published?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params?.tag) query.set('tag', params.tag);
  if (params?.published !== undefined) query.set('published', String(params.published));
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.per_page) query.set('per_page', String(params.per_page));
  const qs = query.toString();
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/posts${qs ? `?${qs}` : ''}`);
}

export async function getPost(slug: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/posts/${slug}`);
}

export async function createPost(
  data: Omit<BlogPost, 'id' | 'views' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<BlogPost>> {
  return apiRequest<ApiResponse<BlogPost>>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  id: string,
  data: Partial<Omit<BlogPost, 'id' | 'views' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<BlogPost>> {
  return apiRequest<ApiResponse<BlogPost>>(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/api/posts/${id}`, {
    method: 'DELETE',
  });
}

// ===== AUTH API =====
export async function login(email: string, password: string): Promise<AdminUser> {
  return apiRequest<AdminUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('admin_token');
}

// ===== UPLOAD API =====
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('admin_token');
  const API_URL = import.meta.env.VITE_API_URL || 'https://portfolio-worker.piter3luty1995.workers.dev';

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error((err as { error?: string }).error ?? 'Upload failed');
  }

  return response.json() as Promise<UploadResponse>;
}

// ===== STATS API =====
export async function getStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/api/stats');
}

// ===== CONTACT API =====
export async function sendContactMessage(
  data: ContactForm
): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ===== MESSAGES API (Admin) =====
export async function getMessages(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ContactMessage>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.per_page) query.set('per_page', String(params.per_page));
  const qs = query.toString();
  return apiRequest<PaginatedResponse<ContactMessage>>(`/api/messages${qs ? `?${qs}` : ''}`);
}

export async function markMessageAsRead(id: string): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/api/messages/${id}/read`, {
    method: 'PUT',
  });
}

export async function deleteMessage(id: string): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/api/messages/${id}`, {
    method: 'DELETE',
  });
}
