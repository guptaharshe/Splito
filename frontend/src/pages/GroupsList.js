import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowRight, FiPlus, FiUsers, FiCalendar } from 'react-icons/fi';

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await fetchApi('/api/groups');
        setGroups(data.groups || []);
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  return (
    <div className="p-8 max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Your Groups</h1>
          <p className="text-sm text-text-secondary">Manage and track shared expenses with your friends, family, or flatmates.</p>
        </div>
        <button className="bg-text-primary text-bg-base flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <FiPlus size={16} /> Create Group
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-text-secondary">Loading groups...</div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <Link 
              key={g.id} 
              to={`/groups/${g.id}`} 
              className="bg-bg-surface border border-border-subtle rounded-md p-6 hover:border-border-focus hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center border border-border-default">
                  <FiUsers className="text-text-secondary" />
                </div>
                <FiArrowRight className="text-text-tertiary group-hover:text-text-primary transition-colors transform group-hover:translate-x-1" />
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1">{g.name}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 flex-grow mb-4">
                {g.description || 'No description provided.'}
              </p>
              <div className="border-t border-border-subtle/50 pt-4 flex items-center gap-2 text-xs text-text-tertiary font-medium">
                <FiCalendar />
                <span>Created {new Date(g.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-default border-dashed rounded-md p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
            <FiUsers className="text-2xl text-text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">No Groups Yet</h2>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            You aren't a part of any split groups. Create a new group to start sharing expenses!
          </p>
          <button className="bg-text-primary text-bg-base flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            <FiPlus size={16} /> Create Your First Group
          </button>
        </div>
      )}
    </div>
  );
}
