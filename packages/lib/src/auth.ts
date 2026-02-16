// Authentication hooks for KN Biosciences
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

export const authHooks = {
  useAuth: () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check for stored auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Validate token and get user info
        validateToken(token)
          .then(setUser)
          .catch(() => setUser(null))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }, []);

    const login = async (email: string, password: string) => {
      try {
        // Call login API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const { token, user } = await response.json();
          localStorage.setItem('auth_token', token);
          setUser(user);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid credentials' };
        }
      } catch (error) {
        return { success: false, error: 'Login failed' };
      }
    };

    const logout = () => {
      localStorage.removeItem('auth_token');
      setUser(null);
    };

    return { user, loading, login, logout };
  },
};

const validateToken = async (token: string): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/validate', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
};