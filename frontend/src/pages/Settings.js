import React, { useEffect, useState } from 'react';
import { FiUser, FiSettings, FiBell, FiShield, FiMoon } from 'react-icons/fi';
import { fetchApi } from '../lib/api';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchApi('/api/auth/me');
        setUser(res.user);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-text-secondary">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-[800px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Profile Section */}
        <section className="bg-bg-surface border border-border-subtle rounded-md shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-subtle/50 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent text-text-inverse flex items-center justify-center text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || <FiUser />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{user?.name || 'User Profile'}</h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="inline-block mt-2 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  System Admin
                </span>
              )}
            </div>
          </div>
          <div className="p-6 bg-bg-elevated/20 flex justify-end">
            <button className="bg-transparent border border-border-default text-text-primary text-sm font-medium px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors">
              Edit Profile
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3 px-1">Preferences</h3>
          <div className="bg-bg-surface border border-border-subtle rounded-md shadow-sm divide-y divide-border-subtle/50">
            
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary">
                  <FiBell size={16} />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Email Notifications</p>
                  <p className="text-xs text-text-secondary">Receive updates when expenses are added.</p>
                </div>
              </div>
              {/* Fake Toggle */}
              <div className="w-10 h-6 bg-success rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-bg-surface rounded-full shadow-sm transform translate-x-4"></div>
              </div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary">
                  <FiMoon size={16} />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Dark Mode</p>
                  <p className="text-xs text-text-secondary">Toggle the dark aesthetic.</p>
                </div>
              </div>
              {/* Fake Toggle Off */}
              <div className="w-10 h-6 bg-border-default rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-bg-surface rounded-full shadow-sm"></div>
              </div>
            </div>

          </div>
        </section>

        {/* Security Section */}
        <section>
          <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3 px-1">Security</h3>
          <div className="bg-bg-surface border border-border-subtle rounded-md shadow-sm divide-y divide-border-subtle/50">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary">
                  <FiShield size={16} />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Change Password</p>
                  <p className="text-xs text-text-secondary">Ensure your account is using a secure password.</p>
                </div>
              </div>
              <button className="text-sm font-medium text-accent hover:underline">
                Update
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
