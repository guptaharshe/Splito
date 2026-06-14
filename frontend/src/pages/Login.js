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
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative subtle background gradients for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-border-default opacity-30 blur-3xl mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-border-default opacity-30 blur-3xl mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-bg-surface/80 backdrop-blur-xl border border-border-subtle rounded-xl p-8 sm:p-10 shadow-xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-md rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-bg-surface font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome to Splito</h1>
          <p className="text-sm text-text-secondary mt-2">Sign in to manage your shared expenses</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-primary font-medium ml-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`bg-bg-input border ${error ? 'border-error' : 'border-border-default focus:border-border-focus focus:ring-4 focus:ring-accent-subtle'} rounded-base px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder-text-tertiary shadow-sm`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-primary font-medium ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`bg-bg-input border ${error ? 'border-error' : 'border-border-default focus:border-border-focus focus:ring-4 focus:ring-accent-subtle'} rounded-base px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder-text-tertiary shadow-sm`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-error mt-1 ml-1 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-accent hover:bg-accent-hover text-text-inverse font-medium text-sm py-3 px-4 rounded-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-text-tertiary mt-8 text-center border-t border-border-subtle pt-6">
          Having trouble? Contact your group admin to verify your access.
        </p>
      </div>
    </div>
  );
}
