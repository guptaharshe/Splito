import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowRight, FiPlus, FiDollarSign, FiActivity, FiUsers, FiDatabase, FiUploadCloud, FiBarChart2 } from 'react-icons/fi';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [netBalance, setNetBalance] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userData = await fetchApi('/api/auth/me');
        const adminStatus = userData.user && userData.user.role === 'admin';
        setIsAdmin(adminStatus);

        if (adminStatus) {
          const stats = await fetchApi('/api/admin/analytics');
          setAnalytics(stats);
        } else {
          const [groupsData, balanceData] = await Promise.all([
            fetchApi('/api/groups'),
            fetchApi('/api/balances/net')
          ]);
          setGroups(groupsData.groups || []);
          setNetBalance(balanceData.netBalancePaise || 0);
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
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-8 animate-pulse mt-4">
        <div className="w-48 h-8 bg-border-default/40 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-border-default/30 rounded"></div>
          <div className="h-32 bg-border-default/30 rounded"></div>
          <div className="h-32 bg-border-default/30 rounded"></div>
        </div>
        <div className="h-48 bg-border-default/30 rounded mt-4"></div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (isAdmin) {
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">System Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
            <FiUsers className="text-2xl text-text-secondary mb-3" />
            <p className="text-xs text-text-secondary font-medium uppercase mb-1">Total Users</p>
            <h2 className="text-3xl font-bold text-text-primary">{analytics?.totalUsers || 0}</h2>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
            <FiDatabase className="text-2xl text-text-secondary mb-3" />
            <p className="text-xs text-text-secondary font-medium uppercase mb-1">Active Groups</p>
            <h2 className="text-3xl font-bold text-text-primary">{analytics?.totalGroups || 0}</h2>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
            <FiBarChart2 className="text-2xl text-text-secondary mb-3" />
            <p className="text-xs text-text-secondary font-medium uppercase mb-1">Total Volume Processed</p>
            <h2 className="text-3xl font-bold text-text-primary">
              ₹{((analytics?.totalVolumePaise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </div>
        </div>

        <section className="bg-bg-surface border border-border-subtle rounded p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <FiUploadCloud className="text-text-secondary" /> Data Management Portal
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center rounded px-3 py-2 bg-bg-base">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-1">CSV Bulk Import</h3>
              <p className="text-sm text-text-secondary mb-4">
                Ingest historical expenses data from raw CSV exports. The system will automatically parse split logic and flag anomalies.
              </p>
              <Link to="/import" className="inline-flex items-center gap-2 bg-text-primary text-bg-base font-medium py-2.5 px-6 rounded text-sm">
                Go to Import Engine <FiArrowRight />
              </Link>
            </div>
            <div className="text-center p-4 border-l border-border-subtle pl-8">
              <p className="text-3xl font-bold text-text-primary mb-1">{analytics?.totalImports || 0}</p>
              <p className="text-sm text-text-secondary">Past Imports</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --- NORMAL USER VIEW ---
  return (
    <div className="p-8 max-w-[1100px] mx-auto flex flex-col gap-8 animate-fade-in">
      
      {/* Hero Balance Card */}
      <section className="bg-bg-surface border border-border-subtle rounded-md p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Overall Net Balance</p>
        {netBalance > 0 ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-success tracking-tight mb-2">
              +₹{(netBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h1>
            <p className="text-sm text-text-tertiary">You are owed money across all your groups.</p>
          </>
        ) : netBalance < 0 ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-error tracking-tight mb-2">
              -₹{(Math.abs(netBalance) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h1>
            <p className="text-sm text-text-tertiary">You owe money across all your groups.</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-secondary tracking-tight mb-2">₹0</h1>
            <p className="text-sm text-text-tertiary">You are completely settled up.</p>
          </>
        )}
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
