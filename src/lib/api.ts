import axios from 'axios';

// In development, VITE_API_BASE_URL is empty and Vite proxy handles /api requests
// In production (Vercel), set VITE_API_BASE_URL to your backend URL
const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  
  // If explicitly set, use it
  if (envUrl) {
    console.log('Using API base URL from env:', envUrl);
    return envUrl;
  }
  
  // In development with Vite proxy, use relative paths
  if (import.meta.env.DEV) {
    console.log('Using Vite proxy for API calls');
    return '';
  }
  
  // In production without env var, warn user
  console.warn('VITE_API_BASE_URL is not set. Using relative paths - ensure your hosting provider has proper proxy/rewrite rules.');
  return '';
};

const baseURL = getBaseURL();

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
