import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tienda } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchTienda(session.user.id);
          }, 0);
        } else {
          setTienda(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchTienda(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTienda = async (userId: string) => {
    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setTienda(data as Tienda);
    }
  };

  const login = async (nombreTienda: string, password: string) => {
    const email = `${nombreTienda.toLowerCase().replace(/\s+/g, '_')}@bodega.local`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const register = async (nombreTienda: string, password: string) => {
    const email = `${nombreTienda.toLowerCase().replace(/\s+/g, '_')}@bodega.local`;
    
    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Create tienda record
    const { error: tiendaError } = await supabase
      .from('tiendas')
      .insert({
        id: authData.user.id,
        nombre: nombreTienda.toUpperCase(),
      });

    if (tiendaError) {
      throw tiendaError;
    }

    return authData;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setTienda(null);
  };

  return {
    user,
    session,
    tienda,
    loading,
    login,
    register,
    logout,
  };
}
