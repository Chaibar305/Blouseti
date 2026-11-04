'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Server Action pour la connexion administrateur via Supabase Auth
 */
export async function loginAdminAction(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: 'Veuillez saisir votre email et votre mot de passe.',
    };
  }

  // Validation format email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Format d\'adresse email invalide.',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn('Supabase auth login failed:', error.message);
      let userFriendlyError = 'Identifiants invalides. Vérifiez votre email et mot de passe.';
      if (error.message.includes('Invalid login credentials')) {
        userFriendlyError = 'Email ou mot de passe incorrect.';
      } else if (error.message.includes('Email not confirmed')) {
        userFriendlyError = 'Adresse email non confirmée. Veuillez vérifier vos emails.';
      } else if (error.message.includes('Too many requests')) {
        userFriendlyError = 'Trop de tentatives infructueuses. Veuillez patienter un instant.';
      }

      return {
        success: false,
        error: userFriendlyError,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Utilisateur introuvable.',
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch (err: any) {
    console.error('Unexpected login error:', err);
    return {
      success: false,
      error: err.message || 'Une erreur inattendue est survenue lors de la connexion.',
    };
  }
}

/**
 * Server Action pour déconnecter l'administrateur
 */
export async function signOutAdminAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error during signOut:', err);
  }

  redirect('/admin/login');
}

/**
 * Récupère l'utilisateur connecté actuellement côté serveur
 */
export async function getCurrentAdminUserAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'admin',
      },
    };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null };
  }
}
