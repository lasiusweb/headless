import { create } from 'zustand';
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  role: 'retailer' | 'dealer' | 'distributor' | 'customer' | 'farmer' | 'admin';
  first_name?: string;
  last_name?: string;
  phone?: string;
  business_name?: string;
  gst_number?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (data: RegisterData) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
  role: 'retailer' | 'dealer' | 'distributor';
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        role: profile.role || 'retailer',
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        business_name: profile.business_name,
        gst_number: profile.gst_number,
      };

      set({ user, isAuthenticated: true, loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error };
    }
  },

  register: async (data: RegisterData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            role: data.role,
          },
        },
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user!.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        business_name: data.businessName,
        role: data.role,
      });

      if (profileError) throw profileError;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, loading: false });
  },

  refreshUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        role: profile.role || 'retailer',
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        business_name: profile.business_name,
        gst_number: profile.gst_number,
      };

      set({ user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));

// Initialize auth state on client side
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(() => {
    useAuth.getState().refreshUser();
  });

  supabase.auth.onAuthStateChange(() => {
    useAuth.getState().refreshUser();
  });
}
