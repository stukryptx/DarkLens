import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ForumsView from './components/ForumsView';
import ForumDetail from './components/ForumDetail';
import Launcher from './components/Launcher';
import TelegramModule from './components/TelegramModule';
import NotesView from './components/NotesView';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="content-area" style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forums" element={<ForumsView />} />
            <Route path="/forums/:id/*" element={<ForumDetail />} />
            <Route path="/launcher" element={<Launcher />} />
            <Route path="/identities" element={<div style={{padding: '24px'}}>Identities module coming soon.</div>} />
            <Route path="/notes" element={<NotesView />} />
            <Route path="/channels" element={<TelegramModule />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
