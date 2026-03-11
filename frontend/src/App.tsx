import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layout
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// UI
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Preloader } from '@/components/ui/Preloader';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

// Hooks
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

// Pages
import { Home } from '@/pages/Home';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Blog } from '@/pages/Blog';
import { BlogPost } from '@/pages/BlogPost';

// Admin pages
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AdminPosts } from '@/pages/admin/AdminPosts';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminTestimonials } from '@/pages/admin/AdminTestimonials';
import { AdminExperience } from '@/pages/admin/AdminExperience';
import { AdminSkills } from '@/pages/admin/AdminSkills';
import { AdminSettings } from '@/pages/admin/AdminSettings';

// Styles
import './index.css';

// ===== PROTECTED ROUTE =====
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

// ===== PAGE TRANSITION WRAPPER =====
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" as const }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ===== MAIN LAYOUT (with header/footer) =====
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

// ===== SMOOTH SCROLL INIT =====
function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useSmoothScroll();
  return <>{children}</>;
}

// ===== SCROLL TO TOP ON NAVIGATION =====
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// ===== APP CONTENT =====
function AppContent() {
  return (
    <>
      <ScrollToTop />
      <ScrollProgress />

      <PageTransition>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <MainLayout>
                <ProjectDetail />
              </MainLayout>
            }
          />
          <Route
            path="/blog"
            element={
              <MainLayout>
                <Blog />
              </MainLayout>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <MainLayout>
                <BlogPost />
              </MainLayout>
            }
          />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute>
                <AdminPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/testimonials"
            element={
              <ProtectedRoute>
                <AdminTestimonials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/experience"
            element={
              <ProtectedRoute>
                <AdminExperience />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/skills"
            element={
              <ProtectedRoute>
                <AdminSkills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </>
  );
}

// ===== ROOT APP =====
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        {/* Custom cursor (desktop only) */}
        <CustomCursor />

        {/* Preloader */}
        <AnimatePresence>
          {!isLoaded && (
            <Preloader onComplete={() => setIsLoaded(true)} />
          )}
        </AnimatePresence>

        {/* Main app */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AppContent />
        </motion.div>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}
