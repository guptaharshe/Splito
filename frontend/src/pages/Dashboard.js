import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowRight, FiPlus, FiDollarSign, FiActivity, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [groupsData, userData] = await Promise.all([
          fetchApi('/api/groups'),
          fetchApi('/api/auth/me')
        ]);
        setGroups(groupsData.groups || []);
        if (userData.user && userData.user.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-text-secondary">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-[1100px] mx-auto flex flex-col gap-8 animate-fade-in">
      
      {/* Admin Panel */}
      {isAdmin && (
        <section className="bg-bg-surface border border-border-subtle rounded-md p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-text-primary flex items-center gap-2">
              Admin Panel
              <span className="text-[10px] bg-accent text-text-inverse px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Admin</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/import" className="flex flex-col p-4 rounded bg-bg-base hover:bg-bg-elevated border border-border-default transition-colors group">
              <span className="font-medium text-text-primary mb-1">Import CSV</span>
              <span className="text-xs text-text-secondary">Upload historical expenses data</span>
              <FiArrowRight className="mt-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
            </Link>
            <div className="flex flex-col p-4 rounded bg-bg-base border border-border-default opacity-60 cursor-not-allowed">
              <span className="font-medium text-text-primary mb-1">Manage Users</span>
              <span className="text-xs text-text-secondary">Coming soon</span>
            </div>
          </div>
        </section>
      )}

      {/* Hero Balance Card */}
      <section className="bg-bg-surface border border-border-subtle rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Overall Net Balance</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-success tracking-tight mb-2">+₹1,250</h1>
        <p className="text-sm text-text-tertiary">You are owed money across all your groups.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Groups */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-text-primary flex items-center gap-2">
              <FiUsers className="text-text-tertiary" /> Your Groups
            </h2>
            <button className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              <FiPlus /> New Group
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {groups.length > 0 ? groups.map(g => (
              <Link key={g.id} to={`/groups/${g.id}`} className="bg-bg-surface border border-border-subtle rounded-md p-5 hover:border-border-focus transition-colors shadow-sm flex justify-between items-center group">
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{g.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{g.description || 'No description'}</p>
                </div>
                <FiArrowRight className="text-text-tertiary group-hover:text-text-primary transition-colors" />
              </Link>
            )) : (
              <div className="bg-bg-surface border border-border-default border-dashed rounded-md p-8 text-center">
                <p className="text-sm text-text-secondary">You aren't in any groups yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-md font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FiActivity className="text-text-tertiary" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              <button className="w-full flex items-center justify-center gap-2 bg-text-primary text-bg-base font-medium py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity text-sm">
                <FiPlus /> Add Expense
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-transparent border border-border-default text-text-primary font-medium py-2.5 px-4 rounded-md hover:bg-bg-elevated transition-colors text-sm">
                <FiDollarSign /> Record Settlement
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-md font-semibold text-text-primary mb-4">Recent Activity</h2>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4 shadow-sm flex flex-col gap-4">
              <div className="text-sm text-text-tertiary text-center py-4">No recent activity</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
