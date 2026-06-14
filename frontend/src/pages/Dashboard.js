import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await fetchApi('/api/groups');
        setGroups(data.groups || []);
      } catch (err) {
        console.error('Failed to load groups:', err);
      }
    }
    loadGroups();
  }, []);

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

      <div className="max-w-[1100px] mx-auto">
        <div className="bg-bg-surface border border-border-subtle rounded-base p-6 mb-6">
          <h2 className="text-md font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-3">
            <Link to="/import" className="px-4 py-2 bg-text-primary text-bg-base rounded-base text-sm font-medium hover:opacity-90">
              Import CSV
            </Link>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-base p-6">
          <h2 className="text-md font-semibold mb-4">Your Groups</h2>
          <div className="flex flex-col gap-4">
            {groups.map(g => (
              <Link key={g.id} to={`/groups/${g.id}`} className="block p-4 border border-border-default rounded-base hover:border-border-focus transition-colors">
                <h3 className="font-semibold text-accent">{g.name}</h3>
                <p className="text-sm text-text-secondary">{g.description}</p>
              </Link>
            ))}
            {groups.length === 0 && <p className="text-sm text-text-tertiary">No groups found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
