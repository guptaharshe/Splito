import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiUsers, FiDatabase, FiUploadCloud, FiBarChart2, FiArrowUpRight, FiArrowDownRight, FiPieChart } from 'react-icons/fi';

// Simple in-memory cache
const cache = { admin: null, user: null };

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (isAdmin) {
          if (cache.admin) {
            setAnalytics(cache.admin);
            setLoading(false);
            return;
          }
          const stats = await fetchApi('/api/admin/analytics');
          cache.admin = stats;
          setAnalytics(stats);
        } else {
          if (cache.user) {
            setAnalytics(cache.user);
            setLoading(false);
            return;
          }
          const balanceData = await fetchApi('/api/balances/net');
          cache.user = balanceData;
          setAnalytics(balanceData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [isAdmin]);

  if (loading) {
    if (isAdmin) {
      // Admin skeleton
      return (
        <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-8 animate-pulse">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">System Analytics</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 bg-border-default/40 rounded-full"></div>
                <div className="h-3 w-24 bg-border-default/30 rounded"></div>
                <div className="h-8 w-16 bg-border-default/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // User skeleton
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-8 animate-pulse">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Your Analytics</h1>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-8 flex flex-col items-center justify-center gap-3">
          <div className="h-3 w-40 bg-border-default/30 rounded"></div>
          <div className="h-12 w-48 bg-border-default/40 rounded"></div>
          <div className="h-3 w-56 bg-border-default/30 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 bg-border-default/40 rounded-full"></div>
              <div className="h-3 w-24 bg-border-default/30 rounded"></div>
              <div className="h-8 w-16 bg-border-default/40 rounded"></div>
            </div>
          ))}
        </div>
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
  const netBalance = analytics?.netBalancePaise || 0;
  
  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Your Analytics</h1>
      </div>

      {/* Hero Balance Card */}
      <section className="bg-bg-surface border border-border-subtle rounded p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Overall Net Balance</p>
        {netBalance > 0 ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-success tracking-tight mb-2">
              +₹{(netBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h1>
            {/* <p className="text-sm text-text-tertiary">You are owed money across all your groups.</p> */}
          </>
        ) : netBalance < 0 ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-error tracking-tight mb-2">
              -₹{(Math.abs(netBalance) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h1>
            {/* <p className="text-sm text-text-tertiary">You owe money across all your groups.</p> */}
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-secondary tracking-tight mb-2">₹0</h1>
            {/* <p className="text-sm text-text-tertiary">You are completely settled up.</p> */}
          </>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
          <FiArrowUpRight className="text-2xl text-success mb-3" />
          <p className="text-xs text-text-secondary font-medium uppercase mb-1">Total Owed To You</p>
          <h2 className="text-3xl font-bold text-success">
            ₹{((analytics?.totalOwedToYou || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
          <FiArrowDownRight className="text-2xl text-error mb-3" />
          <p className="text-xs text-text-secondary font-medium uppercase mb-1">Total You Owe</p>
          <h2 className="text-3xl font-bold text-error">
            ₹{((analytics?.totalYouOwe || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded p-4 flex flex-col items-center justify-center">
          <FiPieChart className="text-2xl text-text-secondary mb-3" />
          <p className="text-xs text-text-secondary font-medium uppercase mb-1">Expenses Involved</p>
          <h2 className="text-3xl font-bold text-text-primary">{analytics?.totalExpenses || 0}</h2>
        </div>
      </div>
    </div>
  );
}
