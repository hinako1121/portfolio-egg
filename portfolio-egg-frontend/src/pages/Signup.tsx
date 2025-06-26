import { useState } from 'react';
import api from '../lib/axios';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const res = await api.post('/auth', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      // トークン保存（localStorageでもOK）
      localStorage.setItem('access-token', res.headers['access-token']);
      localStorage.setItem('client', res.headers['client']);
      localStorage.setItem('uid', res.headers['uid']);
      // 遷移など
      alert('サインアップ成功');
    } catch (err) {
      setError('サインアップに失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">サインアップ</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3"
        placeholder="Password Confirmation"
        type="password"
        value={passwordConfirmation}
        onChange={e => setPasswordConfirmation(e.target.value)}
      />
      <button onClick={handleSignup} className="bg-green-500 text-white py-2 px-4 rounded">
        サインアップ
      </button>
    </div>
  );
}
