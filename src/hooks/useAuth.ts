import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

// Set base URL based on environment
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://dyse-dashboard.onrender.com';

axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    
    // Check for auth success/error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const authError = urlParams.get('error');
    
    if (authStatus === 'success') {
      console.log('Auth success detected, checking user...');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Recheck auth after successful OAuth
      setTimeout(checkAuth, 1000);
    } else if (authError) {
      console.error('Auth error detected:', authError);
      setError(getErrorMessage(authError));
      setLoading(false);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'oauth_error':
        return 'Discord OAuth authorization failed. Please try again.';
      case 'no_code':
        return 'Authorization code not received. Please try logging in again.';
      case 'state_mismatch':
        return 'Security validation failed. Please try logging in again.';
      case 'auth_failed':
        return 'Authentication failed. Please check your Discord permissions and try again.';
      case 'session_error':
        return 'Session creation failed. Please try again.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  const checkAuth = async () => {
    try {
      setError(null);
      console.log('Checking authentication...');
      
      const response = await axios.get('/api/auth/me');
      console.log('Auth check successful:', response.data.username);
      setUser(response.data);
    } catch (error: any) {
      console.log('Auth check failed:', error.response?.status);
      setUser(null);
      
      // Only set error if it's not a simple 401 (user not logged in)
      if (error.response?.status !== 401) {
        setError('Failed to verify authentication status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    console.log('Initiating login...');
    setError(null);
    setLoading(true);
    
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/login`;
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await axios.post('/api/auth/logout');
      setUser(null);
      setError(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout request fails, clear local state
      setUser(null);
    }
  };

  return { 
    user, 
    loading, 
    error,
    login, 
    logout, 
    checkAuth,
    clearError: () => setError(null)
  };
};