"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, username: string, phone_number?: string) => Promise<{ error: unknown; data?: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: unknown }>;
  resendVerificationEmail: (email: string) => Promise<{ error: unknown }>;
  ensureProfile: (userId: string, email: string, username?: string, phone_number?: string) => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } finally {
      setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          await createProfile(userId);
        }
        return;
      }

      if (data) {
        console.log('Profile loaded:', data);
        setProfile({
          uid: data.id,
          username: data.username,
          email: data.email,
          phone: data.phone_number || '',
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      console.log('Creating profile for user:', userId);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        console.error('No user found for profile creation');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          username: user.data.user.user_metadata?.username || user.data.user.email?.split('@')[0] || 'user',
          email: user.data.user.email || '',
          phone_number: user.data.user.user_metadata?.phone_number || null,
        }]);

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      // Fetch the newly created profile
      await fetchProfile(userId);
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, phone_number?: string) => {
    try {
      console.log('Signing up user:', email);
      
      // 1. Create auth user with email confirmation disabled for development
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone_number,
          },
          // For development: disable email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        return { error: signUpError };
      }

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        return { 
          error: { 
            message: "Please check your email and click the verification link to complete your registration." 
          },
          data: signUpData 
        };
      }

      // If email is already confirmed (or confirmation disabled), create profile
      if (signUpData.user) {
        console.log('Creating profile after signup');
        await createProfile(signUpData.user.id);
      }

      return { error: null, data: signUpData };
    } catch (error) {
      console.error('Exception in signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
      } else {
        console.log('Signin successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Exception in signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        phone_number: updates.phone,
      })
      .eq('id', user.id);

    if (!error && updates.username) {
      setProfile(prev => prev ? { ...prev, username: updates.username! } : null);
    }

    return { error };
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  };

  // Ensure profile exists via API route (robust for RLS)
  const ensureProfile = async (userId: string, email: string, username?: string, phone_number?: string) => {
    try {
      const res = await fetch("/api/profiles/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, username, phone_number }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error("Error ensuring profile:", result.error);
      }
      return result;
    } catch (e) {
      console.error("Exception in ensureProfile:", e);
      return { error: e };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendVerificationEmail,
    ensureProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
