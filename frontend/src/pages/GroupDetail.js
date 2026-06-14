import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export default function GroupDetail() {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [pairwise, setPairwise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGroupData() {
      try {
        const [groupData, balancesData] = await Promise.all([
          fetchApi(`/api/groups/${id}`),
          fetchApi(`/api/groups/${id}/balances`)
        ]);
        
        setGroup(groupData.group);
        setMembers(groupData.members);
        
        // Sort balances: positive first (owed), then negative (owes)
        const sortedBalances = balancesData.balances.sort((a, b) => b.net_balance_paise - a.net_balance_paise);
        setBalances(sortedBalances);
        setPairwise(balancesData.pairwise);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadGroupData();
  }, [id]);

  if (loading) {
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full mt-4">
        <div className="flex flex-col">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex flex-col gap-3">
              <div className="h-8 w-48 bg-border-default/40 rounded"></div>
              <div className="h-4 w-32 bg-border-default/30 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 bg-border-default/30 rounded"></div>
              <div className="h-10 w-36 bg-border-default/30 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-subtle rounded p-4 h-64"></div>
            <div className="bg-bg-surface border border-border-subtle rounded p-4 h-64"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-error">{error}</div>;
  if (!group) return <div className="p-8 text-text-secondary">Group not found</div>;

  const now = new Date().toISOString().split('T')[0];

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">{group.name}</h1>
            <p className="text-sm text-text-secondary">
              Created on {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/groups" 
              className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
            >
              <FiArrowLeft size={16} /> Back to Groups
            </Link>
            <Link 
              to={`/groups/${id}/expenses`}
              className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
            >
              View Expenses <FiArrowRight size={16}/>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members Column */}
          <div className="bg-bg-surface border border-border-subtle rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">Members</h2>
            </div>
            
            <div className="border-b border-border-subtle mb-3 mt-2"></div>

            <ul className="flex flex-col gap-3">
              {members.map(m => {
                let status = 'Active';
                let isInactive = false;
                
                if (m.left_at && new Date(m.left_at) <= new Date(now)) {
                  status = `Left ${new Date(m.left_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  isInactive = true;
                } else if (!m.joined_at) {
                  status = 'Guest';
                } else if (new Date(m.joined_at) > new Date(group.created_at)) {
                  status = `Joined ${new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                } else {
                  status = 'Active';
                }

                return (
                  <li key={m.id} className={`flex justify-between items-center text-sm ${isInactive ? 'text-error' : 'text-text-primary'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">●</span>
                      <span>{m.name}</span>
                    </div>
                    <span>{status}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Column: Balances */}
          <div className="bg-bg-surface border border-border-subtle rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">
                {isAdmin ? 'All Balances' : 'My Balances'}
              </h2>
            </div>
            <div className="border-b border-border-subtle mb-3 mt-2"></div>
            
            <ul className="flex flex-col gap-3 mb-6">
              {(isAdmin ? balances : balances.filter(b => b.user_id === user?.id)).map(b => {
                const amount = b.net_balance_paise / 100;
                let statusClass = 'text-text-primary';
                let statusText = '[even]';
                let formattedAmount = `₹0.00`;

                if (amount > 0) {
                  statusClass = 'text-success';
                  statusText = '[owed]';
                  formattedAmount = `+₹${amount.toFixed(2)}`;
                } else if (amount < 0) {
                  statusClass = 'text-error';
                  statusText = '[owes]';
                  formattedAmount = `-₹${Math.abs(amount).toFixed(2)}`;
                }

                return (
                  <li key={b.user_id} className="flex justify-between items-center text-sm">
                    <span>{b.name}</span>
                    <div className={`flex items-center gap-3 whitespace-nowrap justify-end ${statusClass}`}>
                      <span>{formattedAmount}</span>
                      <span className="text-text-secondary">{statusText}</span>
                    </div>
                  </li>
                );
              })}
              {balances.length === 0 && <li className="text-sm text-text-secondary">No balances yet.</li>}
            </ul>

            </div>
        </div>

        {/* Suggested Settlements - Full Width Below Grid */}
        {(isAdmin ? pairwise : pairwise.filter(p => p.from_user_id === user?.id || p.to_user_id === user?.id)).length > 0 && (
          <div className="mt-6 bg-bg-surface border border-border-subtle rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">
                {isAdmin ? 'All Suggested Settlements' : 'My Suggested Settlements'}
              </h2>
            </div>
            <div className="border-b border-border-subtle mb-3 mt-2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {(isAdmin ? pairwise : pairwise.filter(p => p.from_user_id === user?.id || p.to_user_id === user?.id)).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-text-secondary">
                  <span>{p.from_user_name} &rarr; {p.to_user_name}</span>
                  <span className="text-text-primary font-medium">₹{(p.amount_paise / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
