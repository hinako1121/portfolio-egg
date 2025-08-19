import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  profile_image_url?: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
}

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseConfigValid, setFirebaseConfigValid] = useState(true);

  // Firebase認証状態の監視
  useEffect(() => {
    // Firebase設定が無効な場合の検出
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey || apiKey === 'test') {
      console.warn('Firebase configuration is not valid. OAuth features will be disabled.');
      setFirebaseConfigValid(false);
      
      // Firebase設定が無効な場合、ローカルストレージからユーザー情報を復元
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access-token');
      
      if (storedUser && storedUser !== "undefined" && accessToken) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // 無効なデータをクリア
          localStorage.removeItem('user');
          localStorage.removeItem('access-token');
          localStorage.removeItem('client');
          localStorage.removeItem('uid');
        }
      }
      
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // FirebaseユーザーをアプリのUserオブジェクトに変換
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          name: firebaseUser.displayName || '',
          profile_image_url: firebaseUser.photoURL || undefined,
          github_url: firebaseUser.providerData.find(p => p.providerId === 'github.com')?.uid 
            ? `https://github.com/${firebaseUser.providerData.find(p => p.providerId === 'github.com')?.uid}` 
            : undefined
        };
        setUser(appUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase auth state change error:', error);
      setFirebaseConfigValid(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // メールアドレスでログイン
  const loginWithEmail = async (email: string, password: string) => {
    if (!firebaseConfigValid) {
      throw new Error('Firebase認証が設定されていません。管理者にお問い合わせください。');
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  // メールアドレスで新規登録
  const signupWithEmail = async (email: string, password: string, username: string) => {
    if (!firebaseConfigValid) {
      throw new Error('Firebase認証が設定されていません。管理者にお問い合わせください。');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // プロフィール情報を更新
      await updateProfile(userCredential.user, {
        displayName: username
      });
    } catch (error) {
      console.error('Email signup error:', error);
      throw error;
    }
  };

  // Googleでログイン
  const loginWithGoogle = async () => {
    if (!firebaseConfigValid) {
      throw new Error('Firebase認証が正しく設定されていません。Firebaseプロジェクトの設定を確認してください。');
    }
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // GitHubでログイン
  const loginWithGitHub = async () => {
    if (!firebaseConfigValid) {
      throw new Error('Firebase認証が正しく設定されていません。Firebaseプロジェクトの設定を確認してください。');
    }
    
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  };

  // ログアウト
  const logout = async () => {
    if (!firebaseConfigValid) {
      // Firebase設定が無効でもローカルの状態はクリアできる
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // プロフィール更新（必要に応じて実装）
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!firebaseConfigValid) {
      throw new Error('Firebase認証が設定されていません。管理者にお問い合わせください。');
    }
    
    if (!firebaseUser) throw new Error('User not authenticated');
    
    try {
      await updateProfile(firebaseUser, {
        displayName: userData.name || firebaseUser.displayName,
        photoURL: userData.profile_image_url || firebaseUser.photoURL
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    firebaseConfigValid,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    updateUserProfile,
    // Rails API認証フォールバック用の状態更新関数
    setUser,
    setIsAuthenticated
  };
}; 