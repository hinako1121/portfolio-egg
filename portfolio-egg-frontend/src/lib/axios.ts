import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Interceptor を使ってリクエスト前にヘッダーを自動追加
api.interceptors.request.use((config) => {
  // サインアップ・サインイン時はトークンを付与しない
  const isAuthRequest =
    (config.url?.endsWith('/auth') && config.method === 'post') ||
    (config.url?.endsWith('/auth/sign_in') && config.method === 'post');

  if (!isAuthRequest) {
    const token = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');
    if (token && client && uid) {
      config.headers['access-token'] = token;
      config.headers['client'] = client;
      config.headers['uid'] = uid;
    }
  }
  return config;
});

export default api;
