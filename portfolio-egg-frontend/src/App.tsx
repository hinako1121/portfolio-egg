import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

import ProfileEdit from './pages/ProfileEdit';
import NewApp from './pages/NewApp';
import AppList from './pages/AppList';
import AppDetail from './pages/apps/AppDetail';
import EditApp from './pages/apps/edit/EditApp';
import NewVersion from './pages/apps/NewVersion';
import { useScrollToTop } from './hooks/useScrollToTop';

function AppContent() {
  useScrollToTop();
  const { loading } = useAuth();

  // Firebase認証の初期化中はローディング表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AppList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/new" element={<NewApp />} />
      <Route path="/apps/new" element={<NewApp />} />
      <Route path="/apps/:id" element={<AppDetail />} />
      <Route path="/apps/:id/edit" element={<EditApp />} />
      <Route path="/apps/:id/versions/new" element={<NewVersion />} />
      <Route path="/profile/edit" element={<ProfileEdit />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
