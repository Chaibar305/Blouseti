'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { loginAdminAction } from '@/app/actions/auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/admin/products';

  const [email, setEmail] = useState(searchParams.get('email') || 'machaibare@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Client-side quick email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      setLoading(false);
      return;
    }

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res = await loginAdminAction(formData);

      if (!res.success) {
        setErrorMessage(
          res.error || 'Identifiants invalides. Vérifiez votre email et mot de passe.'
        );
        setLoading(false);
        return;
      }

      // Successful login -> Redirect to destination
      router.push(nextParam);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-7 sm:p-9 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-md shadow-[#1B2A4A]/10">
          <Image
            src="/logo.png"
            alt="Blouseti Logo"
            width={52}
            height={52}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">
              Blouseti
            </h1>
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded" dir="rtl">
              بلوزتي
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Espace d&apos;Administration Sécurisé • Supabase Auth
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Email Field */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs">
            Email Administrateur <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@blouseti.shop"
              required
              autoComplete="email"
              className="w-full min-h-[46px] text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium transition-all"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Password Field with Show/Hide Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-700 text-xs">
              Mot de passe <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="w-full min-h-[46px] text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium transition-all"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-600" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-[#1B2A4A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Vérification des identifiants...</span>
            </>
          ) : (
            <>
              <span>Se connecter à l&apos;espace Admin</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </>
          )}
        </button>

      </form>

      {/* Security Reassurance footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Session chiffrée SSL • Supabase Auth JWT</span>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1B2A4A] to-[#111C32] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <Suspense fallback={
        <div className="bg-white/90 p-8 rounded-3xl text-center shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A] mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Chargement de la page de connexion...</p>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>

    </div>
  );
}
