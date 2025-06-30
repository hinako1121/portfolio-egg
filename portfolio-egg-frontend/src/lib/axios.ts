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

// レスポンスで新しいトークンがあれば保存
api.interceptors.response.use((response) => {
  const newToken = response.headers['access-token'];
  const newClient = response.headers['client'];
  const newUid = response.headers['uid'];
  if (newToken) localStorage.setItem('access-token', newToken);
  if (newClient) localStorage.setItem('client', newClient);
  if (newUid) localStorage.setItem('uid', newUid);
  return response;
});

export default api;
