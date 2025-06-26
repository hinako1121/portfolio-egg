import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    profile_image: '',
    bio: '',
    github_url: '',
    twitter_url: '',
  });

  const getProfile = async () => {
    const res = await api.get('/auth/validate_token');
    setProfile({
      username: res.data.data.username ?? '',
      profile_image: res.data.data.profile_image ?? '',
      bio: res.data.data.bio ?? '',
      github_url: res.data.data.github_url ?? '',
      twitter_url: res.data.data.twitter_url ?? '',
    });
  };

  const updateProfile = async () => {
    await api.put('/auth', profile);
    alert('プロフィールを更新しました');
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">プロフィール編集</h2>
      <input className="border p-2 w-full mb-2" placeholder="ユーザー名"
        value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
      <input className="border p-2 w-full mb-2" placeholder="プロフィール画像"
        value={profile.profile_image} onChange={e => setProfile({ ...profile, profile_image: e.target.value })} />
      <textarea className="border p-2 w-full mb-2" placeholder="自己紹介"
        value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
      <input className="border p-2 w-full mb-2" placeholder="GitHub URL"
        value={profile.github_url} onChange={e => setProfile({ ...profile, github_url: e.target.value })} />
      <input className="border p-2 w-full mb-2" placeholder="X URL"
        value={profile.twitter_url} onChange={e => setProfile({ ...profile, twitter_url: e.target.value })} />
      <button onClick={updateProfile} className="bg-green-500 text-white py-2 px-4 rounded">保存</button>
    </div>
  );
}

function getAuthHeaders() {
  return {
    'access-token': localStorage.getItem('access-token') || '',
    'client': localStorage.getItem('client') || '',
    'uid': localStorage.getItem('uid') || '',
  };
}
