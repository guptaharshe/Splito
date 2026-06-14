import { supabase } from './supabase';

let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Bulletproof: Force relative API path in production even if .env wrongly contains localhost
if (process.env.NODE_ENV === 'production') {
  API_URL = '/api';
}

export async function fetchApi(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
}
