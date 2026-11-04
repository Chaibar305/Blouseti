'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Loader2,
  Menu,
  X,
  User,
  Settings,
  Tag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOutAdminAction } from '@/app/actions/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load current admin session details
  useEffect(() => {
    async function loadAdminUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email) {
          setAdminEmail(user.email);
        } else {
          setAdminEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Admin Connecté');
        }
      } catch (err) {
        console.error('Failed to get admin user:', err);
      }
    }

    if (pathname !== '/admin/login') {
      loadAdminUser();
    }
  }, [pathname]);

  // If we are on the login page, render children without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutAdminAction();
    } catch {
      // Fallback client sign out if redirect or network interrupt
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Commandes COD', icon: ShoppingBag, badge: 'Direct' },
    { href: '/admin/products', label: 'Catalogue Produits', icon: Shirt },
    { href: '/admin/coupons', label: 'Codes Promo', icon: Tag },
    { href: '/admin/settings', label: 'Paramètres & Contact', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col md:flex-row">
      
      {/* Mobile Top App Bar */}
      <div className="md:hidden bg-[#111C32] text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-lg bg-white p-0.5">
            <Image src="/logo.png" alt="Blouseti" fill className="object-contain" />
          </div>
          <span className="font-black text-base tracking-tight">Blouseti Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Menu Admin"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static w-64 bg-[#111C32] text-white flex flex-col justify-between shrink-0 border-r border-white/10 transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-white p-0.5 shadow-xs">
                <Image src="/logo.png" alt="Blouseti" fill className="object-contain" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight block leading-tight">Blouseti</span>
                <span className="text-[10px] text-sky-400 font-bold tracking-wider uppercase">
                  Dashboard Admin
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar options: View store & Sign out */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Admin user info pill in sidebar */}
          {adminEmail && (
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-mono text-[11px] truncate">{adminEmail}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Voir la Boutique</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Base Supabase Connectée</span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">(qyipotnnjhriwfnmkllb)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connected Admin Email Badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-emerald-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs font-bold max-w-[140px] sm:max-w-none truncate">
                {adminEmail || 'machaibare@gmail.com'}
              </span>
              <span className="hidden sm:inline bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                Admin Autorisé
              </span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="p-3 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}
