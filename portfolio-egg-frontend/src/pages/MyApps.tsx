import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function MyApps() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    api.get('/api/v1/apps').then(res => {
      setApps(res.data);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">自分のアプリ</h2>
      <ul>
        {apps.map((app: any) => (
          <li key={app.id} className="mb-2 border-b pb-2">
            <div className="font-bold">{app.title}</div>
            <div className="text-sm text-gray-500">{app.category}</div>
            <img src="{app.thumbnail_url}"/>
          </li>
        ))}
      </ul>
    </div>
  );
}
