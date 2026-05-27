import axios from 'axios';
import { supabase } from './supabase';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get session with timeout to prevent hangs
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      );

      const { data } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<
        ReturnType<typeof supabase.auth.getSession>
      >;

      if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`;
      }
    } catch (error) {
      // If session fails, continue without auth (public endpoints)
      console.debug('Session fetch failed, continuing without auth', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 - let the caller handle it
    // (useAuth hook handles /auth/me 401s gracefully)
    // Only redirect if it's a real auth failure on protected endpoints
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      // For non-auth endpoints, redirect to login after a short delay
      // This prevents the redirect loop during bootstrap
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

export default api;
