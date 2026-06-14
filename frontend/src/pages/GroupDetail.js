import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function GroupDetail() {
  const { id } = useParams();
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

  if (loading) return <div className="p-8 text-text-secondary">Loading group...</div>;
  if (error) return <div className="p-8 text-error">{error}</div>;
  if (!group) return <div className="p-8 text-text-secondary">Group not found</div>;

  const now = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[1100px] mx-auto">
        <Link to="/dashboard" className="text-accent text-sm hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">{group.name}</h1>
            <p className="text-text-secondary text-sm">
              Created {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Link 
            to={`/groups/${id}/expenses`}
            className="bg-transparent border border-border-default hover:border-border-focus text-text-primary px-4 py-2 text-sm font-medium rounded-base transition-colors"
          >
            View Expenses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Members Column */}
          <div className="bg-bg-surface border border-border-subtle rounded-base p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-semibold">Members</h2>
              <button className="text-accent text-sm font-medium hover:text-accent-hover">
                + Add Member
              </button>
            </div>
            
            <div className="border-b border-border-subtle mb-4"></div>

            <ul className="flex flex-col gap-3">
              {members.map(m => {
                let status = 'Active';
                let isInactive = false;
                
                if (m.left_at && m.left_at <= now) {
                  status = `Left ${new Date(m.left_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  isInactive = true;
                } else if (!m.joined_at) {
                  status = 'Guest';
                } else if (m.joined_at > now) {
                   status = `Joining ${m.joined_at}`;
                } else if (new Date(m.joined_at) > new Date('2026-03-01')) {
                   status = `Joined ${new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                }

                return (
                  <li key={m.id} className={`flex justify-between items-center text-sm ${isInactive ? 'text-text-tertiary' : 'text-text-primary'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">{isInactive ? '○' : '●'}</span>
                      <span>{m.name}</span>
                    </div>
                    <span>{status}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Balances Column */}
          <div className="bg-bg-surface border border-border-subtle rounded-base p-6">
            <h2 className="text-md font-semibold mb-4">Balances</h2>
            <div className="border-b border-border-subtle mb-4"></div>
            
            <ul className="flex flex-col gap-3 mb-6">
              {balances.map(b => {
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
                    <div className={`flex gap-2 w-[120px] justify-between ${statusClass}`}>
                      <span>{formattedAmount}</span>
                      <span className="text-text-tertiary">{statusText}</span>
                    </div>
                  </li>
                );
              })}
              {balances.length === 0 && <li className="text-sm text-text-tertiary">No balances yet.</li>}
            </ul>

            {pairwise.length > 0 && (
              <>
                <h3 className="text-sm font-medium mb-3 mt-8">Suggested Settlements:</h3>
                <ul className="flex flex-col gap-2">
                  {pairwise.map((p, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm text-text-secondary">
                      <span>{p.from_user_name} &rarr; {p.to_user_name}</span>
                      <span className="text-text-primary">₹{(p.amount_paise / 100).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Link to={`/groups/${id}/settlements`} className="text-accent text-sm mt-4 inline-block hover:underline font-medium">
                  View and Record Settlements &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
