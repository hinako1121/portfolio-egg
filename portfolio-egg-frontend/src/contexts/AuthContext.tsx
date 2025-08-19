import React, { createContext, useContext } from 'react';
import { useFirebaseAuth, type User } from '../hooks/useFirebaseAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  firebaseConfigValid: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, passwordConfirmation: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firebaseAuth = useFirebaseAuth();

  // Firebase認証またはRails API認証への適応
  const login = async (email: string, password: string) => {
    if (firebaseAuth.firebaseConfigValid) {
      // Firebase認証を使用
      await firebaseAuth.loginWithEmail(email, password);
    } else {
      // Rails API認証にフォールバック
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/auth/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.full_messages?.[0] || 'ログインに失敗しました');
      }

      const data = await response.json();

      // トークンを保存
      const accessToken = response.headers.get('access-token');
      const client = response.headers.get('client');
      const uid = response.headers.get('uid');

      if (accessToken) localStorage.setItem('access-token', accessToken);
      if (client) localStorage.setItem('client', client);
      if (uid) localStorage.setItem('uid', uid);

      // プロフィール情報を取得してより詳細なユーザー情報を設定
      try {
        const profileResponse = await fetch(`${apiUrl}/api/v1/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'access-token': accessToken || '',
            'client': client || '',
            'uid': uid || '',
          },
          credentials: 'include',
        });

        let user;
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
                     // プロフィール情報を使用（画像URLを含む）
           user = {
             id: profileData.id.toString(),
             email: profileData.email,
             username: profileData.username || profileData.email.split('@')[0],
             name: profileData.username || profileData.email.split('@')[0],
             profile_image_url: profileData.profile_image_url,
             bio: profileData.bio,
             github_url: profileData.github_url,
             twitter_url: profileData.twitter_url
           };
          console.log('Profile data loaded:', profileData);
        } else {
          // プロフィール取得に失敗した場合は基本情報のみ使用
          user = {
            id: data.data.id.toString(),
            email: data.data.email,
            username: data.data.username || data.data.email.split('@')[0],
            name: data.data.name || data.data.username || data.data.email.split('@')[0],
            profile_image_url: data.data.profile_image_url
          };
          console.log('Using basic user data:', data.data);
        }

        // 手動でユーザー状態を更新
        firebaseAuth.setUser(user);
        firebaseAuth.setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        // プロフィール取得に失敗した場合は基本情報のみ使用
        const user = {
          id: data.data.id.toString(),
          email: data.data.email,
          username: data.data.username || data.data.email.split('@')[0],
          name: data.data.name || data.data.username || data.data.email.split('@')[0],
          profile_image_url: data.data.profile_image_url
        };

        firebaseAuth.setUser(user);
        firebaseAuth.setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  };

  const signup = async (email: string, password: string, passwordConfirmation: string, username: string) => {
    if (firebaseAuth.firebaseConfigValid) {
      // Firebase認証を使用
      if (password !== passwordConfirmation) {
        throw new Error('パスワードが一致しません');
      }
      await firebaseAuth.signupWithEmail(email, password, username);
    } else {
      // Rails API認証にフォールバック
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          password_confirmation: passwordConfirmation,
          username 
        }),
        credentials: 'include',
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

      // ユーザー情報を設定
      const user = {
        id: data.data.id.toString(),
        email: data.data.email,
        username: data.data.username || data.data.email.split('@')[0],
        name: data.data.name || data.data.username || data.data.email.split('@')[0],
        profile_image_url: data.data.profile_image_url
      };

      // 手動でユーザー状態を更新
      firebaseAuth.setUser(user);
      firebaseAuth.setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const logout = async () => {
    if (firebaseAuth.firebaseConfigValid) {
      // Firebase認証のログアウト
      await firebaseAuth.logout();
    } else {
      // Rails API認証のログアウト
      localStorage.removeItem('access-token');
      localStorage.removeItem('client');
      localStorage.removeItem('uid');
      localStorage.removeItem('user');
      firebaseAuth.setUser(null);
      firebaseAuth.setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (firebaseAuth.firebaseConfigValid) {
      await firebaseAuth.updateUserProfile(userData);
    } else {
      // Rails API認証の場合のプロフィール更新（必要に応じて実装）
      throw new Error('プロフィール更新はFirebase認証でのみ利用可能です');
    }
  };

  const refreshUser = async () => {
    if (firebaseAuth.firebaseConfigValid) {
      // Firebase認証では自動的にユーザー状態が同期されるため、特別な処理は不要
    } else {
      // Rails API認証の場合（必要に応じて実装）
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "undefined") {
        const user = JSON.parse(storedUser);
        firebaseAuth.setUser(user);
        firebaseAuth.setIsAuthenticated(true);
      }
    }
  };

  const contextValue: AuthContextType = {
    user: firebaseAuth.user,
    isAuthenticated: firebaseAuth.isAuthenticated,
    loading: firebaseAuth.loading,
    firebaseConfigValid: firebaseAuth.firebaseConfigValid,
    login,
    signup,
    loginWithGoogle: firebaseAuth.loginWithGoogle,
    loginWithGitHub: firebaseAuth.loginWithGitHub,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
