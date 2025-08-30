import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  testConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user signs in and profile doesn't exist, create one
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureProfileExists(session.user);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if profile exists for existing session
      if (session?.user) {
        await ensureProfileExists(session.user);
      }
      
      setLoading(false);
    });

    // Test connection on mount
    testConnection();

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to ensure profile exists
  const ensureProfileExists = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error);
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
        const displayName = user.user_metadata?.display_name || username;
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: username.toLowerCase(),
            display_name: displayName,
            total_books_read: 0,
            total_reviews: 0,
            total_nfts_earned: 0,
            reading_streak: 0,
            community_points: 0,
            total_likes_received: 0,
            total_comments_received: 0,
            total_shares_received: 0
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Basic validation
      if (!email || !password || !username) {
        return { error: { message: 'All fields are required' } };
      }

      if (password.length < 6) {
        return { error: { message: 'Password must be at least 6 characters' } };
      }

      if (username.length < 3) {
        return { error: { message: 'Username must be at least 3 characters' } };
      }

      // Clean username (remove spaces, make lowercase)
      const cleanUsername = username.trim().toLowerCase();

      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error on no rows

      if (checkError) {
        console.error('Username check error:', checkError);
        return { error: { message: 'Failed to check username availability' } };
      }

      if (existingUser) {
        return { error: { message: 'Username already taken' } };
      }

      console.log('Attempting signup with:', { email: email.trim(), username: cleanUsername });

      // Proceed with signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: username.trim()
          }
        }
      });

      if (signUpError) {
        console.error('Signup error details:', {
          message: signUpError.message,
          status: signUpError.status,
          details: signUpError
        });
        
        if (signUpError.message.includes('already_registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } };
        }
        
        return { error: signUpError };
      }

      console.log('Signup successful:', { 
        userId: data.user?.id, 
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at 
      });

      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Basic validation
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }

      console.log('Attempting signin with email:', email.trim());

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Signin error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          details: error
        });
        
        // Provide user-friendly error messages based on error type
        if (error.message === 'Invalid login credentials') {
          return { error: { message: 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.' } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Please check your email and click the verification link before signing in.' } };
        } else if (error.message.includes('signup_disabled')) {
          return { error: { message: 'Authentication is currently disabled. Please try again later.' } };
        }
        
        return { error: { message: error.message } };
      }

      console.log('Signin successful for user:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Unexpected signin error:', error);
      return { error: { message: 'An unexpected error occurred during signin' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Test function to check Supabase connectivity
  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful. Profile count:', data);
      }
    } catch (error) {
      console.error('Connection test error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    testConnection,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};