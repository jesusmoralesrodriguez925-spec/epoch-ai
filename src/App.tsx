import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getCurrentSession, signOutUser } from './services/auth';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Restore persistent session on boot safely
      const savedUser = getCurrentSession();
      if (savedUser && savedUser.uid && savedUser.email) {
        setUser(savedUser);
      }
    } catch (err) {
      console.warn('Could not restore session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0c0d14] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Iniciando KODI AI...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#0c0d14]">
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <LoginScreen onSuccess={handleLoginSuccess} />
        )}
      </div>
    </ErrorBoundary>
  );
}

