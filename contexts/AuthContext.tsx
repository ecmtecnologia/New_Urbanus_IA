import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de Permissão e Papéis
export type UserRole = 'ADMIN' | 'JURIDICO' | 'SOCIAL' | 'TECNICO' | 'MASTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, password?: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const hydrateFromApi = async () => {
    const token = localStorage.getItem('urbanus_token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token expired or invalid.');
      }

      const data = await response.json();
      const currentUser = data.user as User;
      setUser(currentUser);
      localStorage.setItem('urbanus_user', JSON.stringify(currentUser));
    } catch {
      setUser(null);
      localStorage.removeItem('urbanus_token');
      localStorage.removeItem('urbanus_user');
    }
  };

  useEffect(() => {
    hydrateFromApi();
  }, []);

  const login = async (email: string, role: UserRole, password?: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação.');
    }

    const data = await response.json();
    const authenticatedUser = data.user as User;

    localStorage.setItem('urbanus_token', data.token);
    localStorage.setItem('urbanus_user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbanus_token');
    localStorage.removeItem('urbanus_user');
  };

  const hasPermission = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'MASTER' || user.role === 'ADMIN') return true; // Master/Admin tem acesso total
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
