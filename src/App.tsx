import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading, error, clearError } = useAuth();

  useEffect(() => {
    // Clear any error after 10 seconds
    if (error) {
      const timer = setTimeout(clearError, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#2C2F33] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-[#ED4245] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-[#B9BBBE] mb-6">{error}</p>
          <button
            onClick={clearError}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
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