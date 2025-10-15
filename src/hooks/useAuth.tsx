import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Schemas de validação
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status after session is set
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao verificar role:', error);
        return;
      }

      // Check if user has admin role among their roles
      const roles = data?.map(r => r.role) || [];
      const hasAdminRole = roles.includes('admin');
      const primaryRole = hasAdminRole ? 'admin' : (roles[0] || 'disciple');
      
      setUserRole(primaryRole);
      setIsAdmin(hasAdminRole);
    } catch (err) {
      console.error('Erro inesperado ao verificar role:', err);
    }
  };

  // Sanitizar email
  const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
  };

  // Sanitizar nome
  const sanitizeName = (name: string): string => {
    return name.trim().replace(/[<>]/g, '');
  };

  const signUp = async (email: string, password: string, metadata: {
    full_name: string;
    church_denomination: string;
  }) => {
    try {
      // VALIDAR inputs
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);
      const validatedName = nameSchema.parse(metadata.full_name);
      
      // SANITIZAR
      const sanitizedEmail = sanitizeEmail(validatedEmail);
      const sanitizedName = sanitizeName(validatedName);
      const sanitizedDenomination = metadata.church_denomination.trim().replace(/[<>]/g, '');

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: validatedPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedName,
            church_denomination: sanitizedDenomination,
          }
        }
      });
      
      return { error };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { error: { message: error.errors[0].message } };
      }
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // VALIDAR inputs
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);
      
      // SANITIZAR
      const sanitizedEmail = sanitizeEmail(validatedEmail);

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: validatedPassword,
      });
      
      return { error };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { error: { message: error.errors[0].message } };
      }
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { 
    user, 
    session, 
    loading, 
    isAdmin, 
    userRole,
    signUp, 
    signIn, 
    signOut 
  };
};
