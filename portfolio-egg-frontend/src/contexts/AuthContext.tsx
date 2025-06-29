import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  profile_image?: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: { access_token: string; refresh_token: string }) => void;
  signup: (email: string, password: string, passwordConfirmation: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (user: User, tokens: { access_token: string; refresh_token: string }) => {
    // トークンを保存
    localStorage.setItem('access-token', tokens.access_token);
    localStorage.setItem('refresh-token', tokens.refresh_token);
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const signup = async (email: string, password: string, passwordConfirmation: string, username: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          password_confirmation: passwordConfirmation,
          username 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.full_messages?.[0] || '新規登録に失敗しました');
      }

      const data = await response.json();
      
      // トークンを保存
      const accessToken = response.headers.get('access-token');
      const client = response.headers.get('client');
      const uid = response.headers.get('uid');
      
      if (accessToken) localStorage.setItem('access-token', accessToken);
      if (client) localStorage.setItem('client', client);
      if (uid) localStorage.setItem('uid', uid);
      
      setUser(data.data);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('access-token');
    localStorage.removeItem('client');
    localStorage.removeItem('uid');
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'access-token': localStorage.getItem('access-token') || '',
          'client': localStorage.getItem('client') || '',
          'uid': localStorage.getItem('uid') || '',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.full_messages?.[0] || 'プロフィール更新に失敗しました');
      }

      const data = await response.json();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
