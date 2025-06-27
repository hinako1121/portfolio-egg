import { useState } from 'react';
import api from '../lib/axios';

export default function NewApp() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    github_url: '',
    deploy_url: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('app[title]', form.title);
    formData.append('app[description]', form.description);
    formData.append('app[category]', form.category);
    formData.append('app[github_url]', form.github_url);
    formData.append('app[deploy_url]', form.deploy_url);

    if (file) {
      formData.append('app[thumbnail_image]', file);
    }

    try {
      await api.post('/api/v1/apps', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('アプリを投稿しました');
    } catch (error) {
      alert('投稿に失敗しました');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">アプリ投稿</h2>

      <input className="border p-2 w-full mb-2" placeholder="タイトル"
        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

      <textarea className="border p-2 w-full mb-2" placeholder="説明"
        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="カテゴリ"
        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="GitHub URL"
        value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} />

      <input className="border p-2 w-full mb-2" placeholder="公開URL"
        value={form.deploy_url} onChange={e => setForm({ ...form, deploy_url: e.target.value })} />

      <input type="file" accept="image/*" className="mb-4" onChange={e => setFile(e.target.files?.[0] || null)} />

      <button className="bg-blue-600 text-white py-2 px-4 rounded" onClick={handleSubmit}>
        投稿する
      </button>
    </div>
  );
}
