import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
