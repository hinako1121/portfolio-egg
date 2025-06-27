import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function EditApp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', github_url: '', deploy_url: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    api.get(`/api/v1/apps/${id}`)
      .then(res => setForm(res.data));
  }, [id]);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('app[title]', form.title);
    formData.append('app[description]', form.description);
    formData.append('app[category]', form.category);
    formData.append('app[github_url]', form.github_url);
    formData.append('app[deploy_url]', form.deploy_url);
    if (file) {
      formData.append('app[thumbnail_image]', file);
    }
    await api.patch(`/api/v1/apps/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    alert('更新完了');
    navigate('/my-apps');
  };

  const handleDelete = async () => {
    if (confirm('本当に削除しますか？')) {
      await api.delete(`/api/v1/apps/${id}`);
      navigate('/my-apps');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">アプリ編集</h2>
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
      <button onClick={handleUpdate} className="bg-blue-500 text-white py-2 px-4 rounded">更新</button>
      <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded ml-2">削除</button>
    </div>
  );
}
