import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiUploadCloud, FiSettings, FiLogOut, FiSlack } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { fetchApi } from '../lib/api';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch user data to check role
        try {
          const res = await fetchApi('/api/auth/me');
          if (res.user && res.user.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Failed to load user role", e);
        }
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Groups', path: '/groups', icon: FiUsers },
    ...(isAdmin ? [{ name: 'Import Data', path: '/import', icon: FiUploadCloud }] : []),
  ];

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar text-text-inverse flex flex-col transition-all duration-300 shadow-xl z-20">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border-subtle/30">
          <span className="text-xl font-semibold">Splito</span>
          <FiSlack className="text-xl text-text-inverse" />
        </div>

        <div className="flex-1 px-3 py-4 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded transition-colors ${isActive
                    ? 'bg-sidebar-hover text-text-inverse font-medium'
                    : 'text-text-tertiary hover:text-text-inverse hover:bg-sidebar-hover/50'
                  }`}
              >
                <Icon className={`shrink-0`} size={16} />
                <span className="leading-none mt-0.5">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-3 py-4 border-t border-border-subtle/30 flex flex-col gap-1.5">
          <div className="px-3 mb-1">
            <p className="text-sm font-medium text-text-tertiary truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded transition-colors text-text-tertiary hover:text-error hover:bg-sidebar-hover/50"
          >
            <FiLogOut className="shrink-0" size={16} />
            <span className="leading-none mt-0.5">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
