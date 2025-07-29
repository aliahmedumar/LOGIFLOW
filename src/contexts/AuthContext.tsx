// src/contexts/AuthContext.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Operator' | 'Customer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  signup: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = localStorage.getItem('logiflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, pathname]);

  const login = (email: string) => {
    // Simulate login
    const mockUser: User = { id: '1', email, role: 'Manager' };
    localStorage.setItem('logiflow_user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('logiflow_user');
    setUser(null);
    router.push('/login');
  };
  
  const signup = (email: string) => {
    // Simulate signup and login
    const mockUser: User = { id: '2', email, role: 'Customer' };
    localStorage.setItem('logiflow_user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/dashboard');
  };

  if (loading && !(pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')) {
    // Show a loading indicator or a blank screen while checking auth state
    // to prevent flicker, except on auth pages themselves.
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><p>Loading...</p></div>;
  }


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
