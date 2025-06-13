import React from 'react';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C2F33] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#B9BBBE]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#2C2F33]">
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;