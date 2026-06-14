import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Navigate to dashboard on success. Supabase client manages the JWT securely.
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-bg-surface border border-border-subtle rounded-base p-6">
        <h1 className="text-lg font-semibold text-accent mb-1">Splito</h1>
        <p className="text-sm text-text-secondary mb-6">Sign in to your account</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-primary font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`bg-bg-input border ${error ? 'border-error' : 'border-border-default focus:border-border-focus'} rounded-base p-2 text-base text-text-primary outline-none transition-colors`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-primary font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`bg-bg-input border ${error ? 'border-error' : 'border-border-default focus:border-border-focus'} rounded-base p-2 text-base text-text-primary outline-none transition-colors`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-error mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-accent hover:bg-accent-hover text-text-inverse font-medium text-sm py-2 px-4 rounded-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-text-tertiary mt-6 text-center">
          Having trouble? Contact your group admin.
        </p>
      </div>
    </div>
  );
}
