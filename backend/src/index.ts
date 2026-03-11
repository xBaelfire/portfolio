import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ===== TYPES =====
interface Bindings {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  ENVIRONMENT: string;
  R2_PUBLIC_URL?: string;
}

interface JWTPayload {
  email: string;
  exp: number;
}

// ===== HELPERS =====
function generateId(): string {
  return crypto.randomUUID();
}

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Simple comparison for demo — in production use bcrypt via a KV worker binding
  // or a proper hashing library compatible with CF Workers
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hexHash === hash;
}

// ===== APP =====
const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5180', 'https://portfolio-2qb.pages.dev'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ===== AUTH ROUTE =====
app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return jsonError('Email and password are required', 400);
  }

  const adminEmail = c.env.ADMIN_EMAIL;
  const adminHash = c.env.ADMIN_PASSWORD_HASH;

  if (body.email !== adminEmail) {
    return jsonError('Invalid credentials', 401);
  }

  const isValid = await verifyPassword(body.password, adminHash);
  if (!isValid) {
    // Also allow plaintext comparison for development
    const devMatch = body.password === adminHash;
    if (!devMatch) {
      return jsonError('Invalid credentials', 401);
    }
  }

  const payload: JWTPayload = {
    email: body.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };

  const token = await generateJWT(payload, c.env.JWT_SECRET);

  return jsonSuccess({ token, email: body.email });
});

// JWT helper (manual implementation for CF Workers compatibility)
async function generateJWT(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signingInput}.${signatureB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signingInput = `${headerB64}.${payloadB64}`;
  const signatureBytes = Uint8Array.from(
    atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
    (c) => c.charCodeAt(0)
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(signingInput)
  );

  if (!isValid) return null;

  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as JWTPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

// Auth middleware
async function requireAuth(c: { req: { header: (name: string) => string | undefined }; env: { JWT_SECRET: string } }, next: () => Promise<void>): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Unauthorized', 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return jsonError('Invalid or expired token', 401);
  }

  return next();
}

// ===== PROJECTS ROUTES =====
app.get('/api/projects', async (c) => {
  const url = new URL(c.req.url);
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const per_page = parseInt(url.searchParams.get('per_page') ?? '20');
  const offset = (page - 1) * per_page;

  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: unknown[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured !== null) {
    query += ' AND featured = ?';
    params.push(featured === 'true' ? 1 : 0);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');

  try {
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
    const total = countResult?.count ?? 0;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(per_page, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();

    const projects = results.map((p) => ({
      ...p,
      tech_stack: JSON.parse((p.tech_stack as string) || '[]') as string[],
      featured: p.featured === 1,
    }));

    return jsonSuccess({
      data: projects,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch (err) {
    return jsonError('Failed to fetch projects', 500);
  }
});

app.get('/api/projects/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? OR slug = ?'
    ).bind(id, id).first<Record<string, unknown>>();

    if (!result) return jsonError('Project not found', 404);

    return jsonSuccess({
      ...result,
      tech_stack: JSON.parse((result.tech_stack as string) || '[]') as string[],
      featured: result.featured === 1,
    });
  } catch {
    return jsonError('Failed to fetch project', 500);
  }
});

app.post('/api/projects', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const body = await c.req.json<{
    title: string;
    slug: string;
    description?: string;
    long_description?: string;
    image_url?: string;
    tech_stack?: string[];
    github_url?: string;
    live_url?: string;
    featured?: boolean;
    category?: string;
  }>();

  if (!body.title || !body.slug) {
    return jsonError('Title and slug are required', 400);
  }

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      INSERT INTO projects (id, title, slug, description, long_description, image_url, tech_stack, github_url, live_url, featured, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.title,
      body.slug,
      body.description ?? '',
      body.long_description ?? '',
      body.image_url ?? '',
      JSON.stringify(body.tech_stack ?? []),
      body.github_url ?? '',
      body.live_url ?? '',
      body.featured ? 1 : 0,
      body.category ?? 'web',
      now,
      now
    ).run();

    return jsonSuccess({ id, ...body, created_at: now, updated_at: now }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) return jsonError('Slug already exists', 409);
    return jsonError('Failed to create project', 500);
  }
});

app.put('/api/projects/:id', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');
  const body = await c.req.json<Partial<{
    title: string;
    slug: string;
    description: string;
    long_description: string;
    image_url: string;
    tech_stack: string[];
    github_url: string;
    live_url: string;
    featured: boolean;
    category: string;
  }>>();

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      UPDATE projects
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          description = COALESCE(?, description),
          long_description = COALESCE(?, long_description),
          image_url = COALESCE(?, image_url),
          tech_stack = COALESCE(?, tech_stack),
          github_url = COALESCE(?, github_url),
          live_url = COALESCE(?, live_url),
          featured = COALESCE(?, featured),
          category = COALESCE(?, category),
          updated_at = ?
      WHERE id = ?
    `).bind(
      body.title ?? null,
      body.slug ?? null,
      body.description ?? null,
      body.long_description ?? null,
      body.image_url ?? null,
      body.tech_stack ? JSON.stringify(body.tech_stack) : null,
      body.github_url ?? null,
      body.live_url ?? null,
      body.featured !== undefined ? (body.featured ? 1 : 0) : null,
      body.category ?? null,
      now,
      id
    ).run();

    return jsonSuccess({ id, updated_at: now });
  } catch {
    return jsonError('Failed to update project', 500);
  }
});

app.delete('/api/projects/:id', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    return jsonSuccess(null);
  } catch {
    return jsonError('Failed to delete project', 500);
  }
});

// ===== POSTS ROUTES =====
app.get('/api/posts', async (c) => {
  const url = new URL(c.req.url);
  const tag = url.searchParams.get('tag');
  const published = url.searchParams.get('published');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const per_page = parseInt(url.searchParams.get('per_page') ?? '20');
  const offset = (page - 1) * per_page;

  let query = 'SELECT * FROM posts WHERE 1=1';
  const params: unknown[] = [];

  if (published !== null) {
    query += ' AND published = ?';
    params.push(published === 'true' ? 1 : 0);
  }
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  if (search) {
    query += ' AND (title LIKE ? OR excerpt LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');

  try {
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
    const total = countResult?.count ?? 0;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(per_page, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();

    const posts = results.map((p) => ({
      ...p,
      tags: JSON.parse((p.tags as string) || '[]') as string[],
      published: p.published === 1,
    }));

    return jsonSuccess({
      data: posts,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch {
    return jsonError('Failed to fetch posts', 500);
  }
});

app.get('/api/posts/:slug', async (c) => {
  const slug = c.req.param('slug');

  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM posts WHERE slug = ?'
    ).bind(slug).first<Record<string, unknown>>();

    if (!result) return jsonError('Post not found', 404);

    // Increment views
    await c.env.DB.prepare(
      'UPDATE posts SET views = views + 1 WHERE slug = ?'
    ).bind(slug).run();

    return jsonSuccess({
      ...result,
      tags: JSON.parse((result.tags as string) || '[]') as string[],
      published: result.published === 1,
    });
  } catch {
    return jsonError('Failed to fetch post', 500);
  }
});

app.post('/api/posts', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const body = await c.req.json<{
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    cover_url?: string;
    tags?: string[];
    published?: boolean;
    read_time?: number;
  }>();

  if (!body.title || !body.slug) {
    return jsonError('Title and slug are required', 400);
  }

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      INSERT INTO posts (id, title, slug, excerpt, content, cover_url, tags, published, read_time, views, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      body.title,
      body.slug,
      body.excerpt ?? '',
      body.content ?? '',
      body.cover_url ?? '',
      JSON.stringify(body.tags ?? []),
      body.published ? 1 : 0,
      body.read_time ?? 5,
      now,
      now
    ).run();

    return jsonSuccess({ id, ...body, views: 0, created_at: now, updated_at: now }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) return jsonError('Slug already exists', 409);
    return jsonError('Failed to create post', 500);
  }
});

app.put('/api/posts/:id', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');
  const body = await c.req.json<Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_url: string;
    tags: string[];
    published: boolean;
    read_time: number;
  }>>();

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      UPDATE posts
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          excerpt = COALESCE(?, excerpt),
          content = COALESCE(?, content),
          cover_url = COALESCE(?, cover_url),
          tags = COALESCE(?, tags),
          published = COALESCE(?, published),
          read_time = COALESCE(?, read_time),
          updated_at = ?
      WHERE id = ?
    `).bind(
      body.title ?? null,
      body.slug ?? null,
      body.excerpt ?? null,
      body.content ?? null,
      body.cover_url ?? null,
      body.tags ? JSON.stringify(body.tags) : null,
      body.published !== undefined ? (body.published ? 1 : 0) : null,
      body.read_time ?? null,
      now,
      id
    ).run();

    return jsonSuccess({ id, updated_at: now });
  } catch {
    return jsonError('Failed to update post', 500);
  }
});

app.delete('/api/posts/:id', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return jsonSuccess(null);
  } catch {
    return jsonError('Failed to delete post', 500);
  }
});

// ===== CONTACT ROUTE =====
app.post('/api/contact', async (c) => {
  const body = await c.req.json<{
    name: string;
    email: string;
    subject?: string;
    message: string;
  }>();

  if (!body.name || !body.email || !body.message) {
    return jsonError('Name, email, and message are required', 400);
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return jsonError('Invalid email address', 400);
  }

  if (body.message.length > 2000) {
    return jsonError('Message is too long', 400);
  }

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      INSERT INTO messages (id, name, email, subject, message, read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).bind(id, body.name, body.email, body.subject ?? '', body.message, now).run();

    return jsonSuccess({ message: 'Message sent successfully' });
  } catch {
    return jsonError('Failed to send message', 500);
  }
});

// ===== MESSAGES ROUTES (AUTH REQUIRED) =====
app.get('/api/messages', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const url = new URL(c.req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const per_page = parseInt(url.searchParams.get('per_page') ?? '20');
  const offset = (page - 1) * per_page;

  try {
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages'
    ).first<{ count: number }>();
    const total = countResult?.count ?? 0;

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(per_page, offset).all<Record<string, unknown>>();

    const messages = results.map((m) => ({
      ...m,
      read: m.read === 1,
    }));

    return jsonSuccess({
      data: messages,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch {
    return jsonError('Failed to fetch messages', 500);
  }
});

app.put('/api/messages/:id/read', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');

  try {
    const existing = await c.env.DB.prepare(
      'SELECT id FROM messages WHERE id = ?'
    ).bind(id).first<{ id: string }>();

    if (!existing) return jsonError('Message not found', 404);

    await c.env.DB.prepare(
      'UPDATE messages SET read = 1 WHERE id = ?'
    ).bind(id).run();

    return jsonSuccess({ id, read: true });
  } catch {
    return jsonError('Failed to mark message as read', 500);
  }
});

app.delete('/api/messages/:id', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const id = c.req.param('id');

  try {
    const existing = await c.env.DB.prepare(
      'SELECT id FROM messages WHERE id = ?'
    ).bind(id).first<{ id: string }>();

    if (!existing) return jsonError('Message not found', 404);

    await c.env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
    return jsonSuccess(null);
  } catch {
    return jsonError('Failed to delete message', 500);
  }
});

// ===== STATS ROUTE =====
app.get('/api/stats', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  try {
    const [projectCount, postCount, messageCount, unreadCount, viewsResult, featuredCount] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM projects').first<{ count: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM posts').first<{ count: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM messages').first<{ count: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM messages WHERE read = 0').first<{ count: number }>(),
      c.env.DB.prepare('SELECT COALESCE(SUM(views), 0) as total FROM posts').first<{ total: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM projects WHERE featured = 1').first<{ count: number }>(),
    ]);

    return jsonSuccess({
      total_projects: projectCount?.count ?? 0,
      total_posts: postCount?.count ?? 0,
      total_messages: messageCount?.count ?? 0,
      unread_messages: unreadCount?.count ?? 0,
      total_views: viewsResult?.total ?? 0,
      featured_projects: featuredCount?.count ?? 0,
    });
  } catch {
    return jsonError('Failed to fetch stats', 500);
  }
});

// ===== UPLOAD ROUTE =====
app.post('/api/upload', async (c) => {
  const authResult = await requireAuth(c as Parameters<typeof requireAuth>[0], async () => {});
  if (authResult) return authResult;

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return jsonError('No file provided', 400);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return jsonError('Invalid file type. Only images are allowed.', 400);
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return jsonError('File too large. Maximum size is 5MB.', 400);
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `uploads/${generateId()}.${ext}`;

  try {
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const r2Base = c.env.R2_PUBLIC_URL ?? '';
    const publicUrl = `${r2Base}${r2Base && !r2Base.endsWith('/') ? '/' : ''}${key}`;

    return jsonSuccess({ url: publicUrl, key });
  } catch {
    return jsonError('Failed to upload file', 500);
  }
});

// ===== 404 FALLBACK =====
app.notFound((c) => {
  return jsonError('Route not found', 404);
});

// ===== ERROR HANDLER =====
app.onError((err, c) => {
  console.error('Worker error:', err.message);
  return jsonError('Internal server error', 500);
});

export default app;
