import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiSlack } from 'react-icons/fi';

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

      <div className="w-full max-w-[420px] bg-bg-surface/80 backdrop-blur-xl rounded p-4 sm:p-6 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Splito <FiSlack className="text-text-primary" />
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-primary font-medium ml-1" htmlFor="email">
              Email Address<span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`bg-bg-base/60 border-b-2 ${error ? 'border-error' : 'border-transparent focus:border-text-primary'} rounded-t px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder-text-secondary`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-primary font-medium ml-1" htmlFor="password">
              Password<span className="text-error">*</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`bg-bg-base/60 border-b-2 ${error ? 'border-error' : 'border-transparent focus:border-text-primary'} rounded-t px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder-text-secondary`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-error mt-1 ml-1 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-accent text-text-inverse font-medium text-sm py-3 px-4 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-xs text-text-secondary mt-6 text-center">
          Having trouble? For test credentials, please refer to the <strong className="text-text-primary">README.md</strong>
        </p>
      </div>
    </div>
  );
}
