import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function AddExpense() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [notes, setNotes] = useState('');

  // Equal split tracking
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await fetchApi(`/api/groups/${groupId}`);
        setMembers(data.members);
        
        // Auto-select current user as payer if they are in the group
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userMember = data.members.find(m => m.id === session.user.id);
          if (userMember) {
            setPaidBy(session.user.id);
          } else if (data.members.length > 0) {
            setPaidBy(data.members[0].id);
          }
        }

        // Auto-select everyone for equal split
        setSelectedMembers(data.members.map(m => m.id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!description || !amount || !paidBy || !date) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    const amountPaise = Math.round(parseFloat(amount) * 100);

    let splits = [];
    if (splitType === 'equal') {
      if (selectedMembers.length === 0) {
        setError('Please select at least one person for the split');
        setSubmitting(false);
        return;
      }
      splits = selectedMembers.map(id => ({ user_id: id }));
    }

    try {
      await fetchApi(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          description,
          amount_paise: amountPaise,
          paid_by: paidBy,
          expense_date: date,
          split_type: splitType,
          notes,
          splits,
        })
      });

      navigate(`/groups/${groupId}/expenses`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleMemberToggle = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-8 text-text-secondary">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-[640px] bg-bg-surface border border-border-subtle rounded-base p-6">
        <h1 className="text-lg font-semibold mb-6">Add Expense</h1>

        {error && <div className="mb-4 p-3 bg-error-subtle border-l-2 border-error text-error text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              placeholder="e.g. Maid salary Apr"
              className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Paid By</label>
              <select
                className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Split Type</label>
              <select
                className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
              >
                <option value="equal">Equal</option>
                <option value="unequal" disabled>Unequal (WIP)</option>
                <option value="percentage" disabled>Percentage (WIP)</option>
                <option value="share" disabled>Share (WIP)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Split Details (Only Equal implemented for UI right now to save time) */}
          {splitType === 'equal' && (
            <div className="flex flex-col gap-2 mt-2 p-4 border border-border-subtle rounded-base bg-bg-elevated">
              <label className="text-sm font-medium text-text-secondary mb-2">Split Equally Between</label>
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(m.id)}
                    onChange={() => handleMemberToggle(m.id)}
                    className="accent-accent"
                  />
                  <span className="text-sm">{m.name}</span>
                </label>
              ))}
              {amount && selectedMembers.length > 0 && (
                <p className="text-xs text-text-secondary mt-2">
                  Preview: ~₹{(amount / selectedMembers.length).toFixed(2)} each
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Notes (Optional)</label>
            <input
              type="text"
              className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link 
              to={`/groups/${groupId}/expenses`}
              className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-elevated border border-border-default rounded-base transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-text-inverse rounded-base transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
