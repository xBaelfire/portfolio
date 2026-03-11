# Portfolio — Premium Full Stack Portfolio

A spectacular, production-ready developer portfolio built with React 19, TypeScript, Tailwind CSS v4, Framer Motion, and a Cloudflare Workers backend.

## Features

- **Premium dark theme** with indigo/purple gradient accents
- **Custom cursor** with magnetic hover effects and ring follower
- **Smooth scrolling** powered by Lenis
- **Animated preloader** with progress bar
- **Character-by-character name reveal** in Hero section
- **Typewriter role cycling** (Full Stack Developer, UI/UX Enthusiast, etc.)
- **Parallax orbs** responding to mouse movement
- **Scroll-spy navigation** with animated active state indicator
- **Framer Motion animations** throughout (stagger, spring, inView)
- **Skills section** with animated progress bars and category tabs
- **Projects grid** with category filters and hover overlays
- **Vertical experience timeline** with draw-on-scroll line
- **Auto-scrolling testimonials carousel** with dots and arrows
- **Blog with search + tag filters + pagination**
- **Contact form** with react-hook-form + zod validation
- **Admin panel** with JWT auth, CRUD for projects and posts
- **Cloudflare Worker API** with D1 (SQLite), R2 (file storage), Hono

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite + @tailwindcss/vite (Tailwind v4)
- Framer Motion
- Lenis (smooth scroll)
- React Router DOM v7
- React Hook Form + Zod
- Lucide React icons

**Backend**
- Cloudflare Workers
- Hono (web framework)
- Cloudflare D1 (SQLite database)
- Cloudflare R2 (object storage)
- JWT authentication

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/          # AdminLayout
│   │   ├── layout/         # Header, Footer
│   │   ├── sections/       # Hero, About, Skills, Projects, ...
│   │   └── ui/             # Button, CustomCursor, Preloader, ...
│   ├── hooks/              # useSmoothScroll, useScrollSpy, useMousePosition
│   ├── lib/                # utils.ts, api.ts
│   ├── pages/
│   │   ├── admin/          # AdminLogin, AdminDashboard, ...
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Home.tsx
│   │   └── ProjectDetail.tsx
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx
│   └── index.css
├── worker/
│   ├── src/index.ts        # Hono Worker with all API routes
│   └── schema.sql          # D1 database schema + seed data
├── wrangler.toml
├── .env.example
└── vite.config.ts
```

## Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (for deployment)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
VITE_API_URL=http://localhost:8787
VITE_SITE_URL=http://localhost:5173
```

### 3. Set up Cloudflare D1 database

```bash
# Create the database
wrangler d1 create portfolio-db

# Update wrangler.toml with the database_id from the output above

# Run the schema and seed data
wrangler d1 execute portfolio-db --file=worker/schema.sql
```

### 4. Configure Worker secrets

```bash
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_EMAIL
wrangler secret put ADMIN_PASSWORD_HASH
```

For `ADMIN_PASSWORD_HASH`: generate a SHA-256 hash of your password:
```bash
echo -n "yourpassword" | sha256sum
```

### 5. Run development servers

**Frontend (Vite):**
```bash
npm run dev
```

**Worker backend:**
```bash
wrangler dev
```

The frontend runs on `http://localhost:5173` and the worker on `http://localhost:8787`.

## Admin Panel

Access the admin panel at `/admin`. After logging in, you can:
- Manage projects (add/edit/delete, toggle featured)
- Write and publish blog posts
- View dashboard stats

## Deployment

### Frontend (Cloudflare Pages)

```bash
npm run build
wrangler pages deploy dist --project-name=portfolio
```

### Worker (Cloudflare Workers)

```bash
wrangler deploy
```

### Update CORS origin

In `worker/src/index.ts`, update the `cors` middleware `origin` array with your production domain:

```typescript
origin: ['https://yourdomain.com'],
```

## Customization

### Personal Info
- Update name in `src/components/sections/Hero.tsx` (`nameLetters`)
- Update roles in `Hero.tsx` (`roles` array)
- Update social links in `Hero.tsx`, `Footer.tsx`, `Contact.tsx`
- Update contact info in `Contact.tsx` (`contactInfo`)
- Update about text in `About.tsx`
- Update skills in `Skills.tsx`
- Replace projects in `Projects.tsx` with your own
- Replace experience in `Experience.tsx`
- Replace testimonials in `Testimonials.tsx`

### Brand Color
The accent color is defined in `src/index.css`:
```css
--accent: #6366f1;        /* indigo-500 */
--accent-secondary: #8b5cf6;  /* violet-500 */
```

### Fonts
Google Fonts are loaded in `src/index.css`. Replace Inter/Fira Code as desired.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Worker API base URL |
| `VITE_SITE_URL` | Frontend site URL |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of admin password |

## License

MIT
