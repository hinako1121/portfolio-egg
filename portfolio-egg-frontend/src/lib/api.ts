import axiosInstance from './axios';

// 型定義
export interface App {
  id: number;
  title: string;
  description: string;
  category: string;
  github_url?: string;
  deploy_url?: string;
  thumbnail_url?: string;
  version: string;
  feedback_count: number;
  overall_score: number;
  user: {
    id: number;
    username: string;
    profile_image_url?: string;
    bio?: string;
    github_url?: string;
    twitter_url?: string;
  }
  created_at: string;
  updated_at: string;
}

export interface AppDetail extends App {
  is_owner: boolean;
  app_versions: AppVersion[];
}

export interface AppVersion {
  id: number;
  version_number: string;
  release_date: string;
  changelog: string;
  feedbacks: Feedback[];
}

export interface Feedback {
  id: number;
  comment: string;
  design_score: number;
  usability_score: number;
  creativity_score: number;
  usefulness_score: number;
  overall_score: number;
  user: {
    id: number;
    username: string;
  };
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
  profile_image_url?: string;
}

export interface CreateAppData {
  title: string;
  description: string;
  category: string;
  github_url?: string;
  deploy_url?: string;
  thumbnail_image?: File;
}

export interface UpdateAppData extends CreateAppData {}

export interface CreateVersionData {
  version_number: string;
  changelog: string;
}

export interface CreateFeedbackData {
  comment: string;
  design_score: number;
  usability_score: number;
  creativity_score: number;
  usefulness_score: number;
  overall_score: number;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
  profile_image?: File;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

export interface SignupData {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
}

// API サービス
export const api = {
  // 認証関連
  auth: {
    // ログイン
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await axiosInstance.post('/api/v1/auth/sign_in', {
        email,
        password
      });
      return response.data;
    },

    // サインアップ
    signup: async (data: SignupData): Promise<AuthResponse> => {
      const response = await axiosInstance.post('/api/v1/auth', {
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        username: data.username
      });
      return response.data;
    },

    // ログアウト
    logout: async (): Promise<void> => {
      await axiosInstance.delete('/api/v1/auth/sign_out');
    }
  },

  // アプリ関連
  apps: {
    // アプリ一覧取得
    list: async (params?: {
      q?: string;
      category?: string;
      sort?: 'newest' | 'popular' | 'feedback';
    }): Promise<App[]> => {
      const response = await axiosInstance.get('/api/v1/apps', { params });
      return response.data;
    },

    // アプリ詳細取得
    get: async (id: number): Promise<AppDetail> => {
      const response = await axiosInstance.get(`/api/v1/apps/${id}`);
      return response.data;
    },

    // アプリ作成
    create: async (data: CreateAppData): Promise<App> => {
      const formData = new FormData();
      formData.append('app[title]', data.title);
      formData.append('app[description]', data.description);
      formData.append('app[category]', data.category);
      if (data.github_url) formData.append('app[github_url]', data.github_url);
      if (data.deploy_url) formData.append('app[deploy_url]', data.deploy_url);
      if (data.thumbnail_image) formData.append('app[thumbnail_image]', data.thumbnail_image);

      const response = await axiosInstance.post('/api/v1/apps', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    // アプリ更新
    update: async (id: number, data: UpdateAppData): Promise<App> => {
      const formData = new FormData();
      formData.append('app[title]', data.title);
      formData.append('app[description]', data.description);
      formData.append('app[category]', data.category);
      if (data.github_url) formData.append('app[github_url]', data.github_url);
      if (data.deploy_url) formData.append('app[deploy_url]', data.deploy_url);
      if (data.thumbnail_image) formData.append('app[thumbnail_image]', data.thumbnail_image);

      const response = await axiosInstance.patch(`/api/v1/apps/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    // アプリ削除
    delete: async (id: number): Promise<void> => {
      await axiosInstance.delete(`/api/v1/apps/${id}`);
    },

    // マイアプリ取得
    myApps: async (): Promise<App[]> => {
      const response = await axiosInstance.get('/api/v1/my-apps');
      return response.data;
    }
  },

  // バージョン関連
  versions: {
    // バージョン一覧取得
    list: async (appId: number): Promise<AppVersion[]> => {
      const response = await axiosInstance.get(`/api/v1/apps/${appId}/app_versions`);
      return response.data;
    },

    // バージョン詳細取得
    get: async (id: number): Promise<AppVersion> => {
      const response = await axiosInstance.get(`/api/v1/app_versions/${id}`);
      return response.data;
    },

    // バージョン作成（アプリ情報も同時に更新）
    create: async (appId: number, data: CreateVersionData | FormData): Promise<AppVersion> => {
      let requestData: any;
      let headers: any = { 'Content-Type': 'application/json' };
      
      if (data instanceof FormData) {
        requestData = data;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        requestData = { app_version: data };
      }
      
      const response = await axiosInstance.post(`/api/v1/apps/${appId}/app_versions`, requestData, { headers });
      return response.data;
    }
  },

  // フィードバック関連
  feedbacks: {
    // フィードバック一覧取得
    list: async (versionId: number): Promise<Feedback[]> => {
      const response = await axiosInstance.get(`/api/v1/app_versions/${versionId}/feedbacks`);
      return response.data;
    },

    // フィードバック作成
    create: async (versionId: number, data: CreateFeedbackData): Promise<Feedback> => {
      const response = await axiosInstance.post(`/api/v1/app_versions/${versionId}/feedbacks`, {
        feedback: data
      });
      return response.data;
    },

    // ユーザーの既存フィードバック取得
    myFeedback: async (versionId: number): Promise<Feedback | null> => {
      const response = await axiosInstance.get(`/api/v1/app_versions/${versionId}/feedbacks/my_feedback`);
      return response.data;
    }
  },

  // ユーザー関連
  users: {
    // プロフィール取得
    profile: async (): Promise<User> => {
      const response = await axiosInstance.get('/api/v1/profile');
      return response.data;
    },

    // プロフィール更新
    updateProfile: async (data: UpdateProfileData): Promise<User> => {
      const formData = new FormData();
      if (data.username) formData.append('user[username]', data.username);
      if (data.bio) formData.append('user[bio]', data.bio);
      if (data.github_url) formData.append('user[github_url]', data.github_url);
      if (data.twitter_url) formData.append('user[twitter_url]', data.twitter_url);
      if (data.profile_image) formData.append('user[profile_image]', data.profile_image);

      const response = await axiosInstance.patch('/api/v1/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
  }
};