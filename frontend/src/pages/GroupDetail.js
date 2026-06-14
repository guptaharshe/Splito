import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGroup() {
      try {
        const data = await fetchApi(`/api/groups/${id}`);
        setGroup(data.group);
        setMembers(data.members);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadGroup();
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
        
        <div className="mb-8">
          <h1 className="text-lg font-semibold">{group.name}</h1>
          <p className="text-text-secondary text-sm">
            Created {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
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

          {/* Balances Column (Placeholder for Phase 6) */}
          <div className="bg-bg-surface border border-border-subtle rounded-base p-6">
            <h2 className="text-md font-semibold mb-4">Balances</h2>
            <div className="border-b border-border-subtle mb-4"></div>
            <p className="text-sm text-text-tertiary">Balance calculations will be implemented in Phase 6.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
