import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import MyApps from './pages/MyApps';
import NewApp from './pages/NewApp';
import EditApp from './pages/EditApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-apps" element={<MyApps />} />
        <Route path="/apps/new" element={<NewApp />} />
        <Route path="/apps/:id/edit" element={<EditApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;