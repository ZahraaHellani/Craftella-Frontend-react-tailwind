import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Login } from './pages/customer/Login';
import { Register } from './pages/customer/Register';
import { Products } from './pages/customer/Products';
import { ProductDetail } from './pages/customer/ProductDetail';
import {Cart} from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { Profile } from './pages/customer/Profile';
import {Community} from './pages/customer/Community';
import { Events } from './pages/customer/Events';
import { Souvenirs } from './pages/customer/Souvenirs';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { ProductsAdmin } from './pages/admin/ProductsAdmin';
import { OrdersAdmin } from './pages/admin/OrdersAdmin';
import { EventsAdmin } from './pages/admin/EventsAdmin';
import { NotificationsAdmin } from './pages/admin/NotificationsAdmin';

// Layout Components
import Header from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import {SidebarAdmin} from './components/layout/SideBarAdmin';
import {Toast}  from './components/ui/Toast';

// Protected Route Wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  // In a real app, check user.role === 'admin'
  // For now, assume all authenticated users can access admin (you'll refine later)
  if (!user) return <Navigate to="/login" />;
  return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <SidebarAdmin />
    <div className="ml-0 md:ml-64 flex-1">
      {children}
    </div>
  </div>;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/community" element={<Community />} />
          <Route path="/souvenirs" element={<Souvenirs />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;