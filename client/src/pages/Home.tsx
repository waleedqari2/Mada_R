/**
 * Design Philosophy: Swiss Design with Modern Arabic Touch
 * - Clean hierarchy with professional blue (#1e3a5f) and gold accents (#d4af37)
 * - Cairo font for headings, Tajawal for numbers
 * - Elevated cards with subtle shadows
 * - Smooth interactions and elegant animations
 * - Editable items with approval workflow
 * 
 * Note: This is a demo page. The main app starts at /login or /dashboard
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      setLocation('/dashboard');
    } else {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="text-center">
        <img src="/images/logo.jpg" alt="Mada Tourism" className="h-20 w-auto mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">نظام إدارة طلبات الصرف</h1>
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}
