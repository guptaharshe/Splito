import React from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[1100px] mx-auto flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Dashboard (WIP)</h1>
        <button 
          onClick={handleLogout}
          className="bg-transparent border border-border-default text-text-primary hover:border-border-focus text-sm font-medium py-1 px-3 rounded-base transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
