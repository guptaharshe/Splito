import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function Settlements() {
  const { id: groupId } = useParams();
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [paidBy, setPaidBy] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupData, settlementsData] = await Promise.all([
          fetchApi(`/api/groups/${groupId}`),
          fetchApi(`/api/groups/${groupId}/settlements`)
        ]);

        setMembers(groupData.members);
        setSettlements(settlementsData.settlements);

        const { data: { session } } = await supabase.auth.getSession();
        if (session && groupData.members.length > 0) {
          const userMember = groupData.members.find(m => m.id === session.user.id);
          if (userMember) {
            setPaidBy(session.user.id);
            const other = groupData.members.find(m => m.id !== session.user.id);
            if (other) setPaidTo(other.id);
          } else {
            setPaidBy(groupData.members[0].id);
            if (groupData.members.length > 1) setPaidTo(groupData.members[1].id);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [groupId]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (paidBy === paidTo) {
      setFormError('Payer and receiver cannot be the same person');
      setSubmitting(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Amount must be greater than zero');
      setSubmitting(false);
      return;
    }

    try {
      const amountPaise = Math.round(parseFloat(amount) * 100);
      await fetchApi(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        body: JSON.stringify({
          paid_by: paidBy,
          paid_to: paidTo,
          amount_paise: amountPaise,
          settlement_date: date,
          notes
        })
      });

      // Reload settlements
      const data = await fetchApi(`/api/groups/${groupId}/settlements`);
      setSettlements(data.settlements);
      setShowModal(false);
      setAmount('');
      setNotes('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-text-secondary">Loading settlements...</div>;
  if (error) return <div className="p-8 text-error">{error}</div>;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[1100px] mx-auto">
        <Link to={`/groups/${groupId}`} className="text-accent text-sm hover:underline mb-4 inline-block">
          &larr; Back to Group
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Settlements</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 text-sm font-medium rounded-base transition-colors"
          >
            + Record Payment
          </button>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated border-b border-border-subtle">
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Date</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">From</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">To</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium text-right">Amount</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm text-text-tertiary">
                      No settlements recorded yet.
                    </td>
                  </tr>
                ) : (
                  settlements.map(s => (
                    <tr key={s.id} className="border-b border-border-subtle hover:bg-bg-elevated transition-colors">
                      <td className="p-3 text-sm text-text-secondary">
                        {new Date(s.settlement_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                      </td>
                      <td className="p-3 text-sm">{s.payer?.name || 'Unknown'}</td>
                      <td className="p-3 text-sm">{s.receiver?.name || 'Unknown'}</td>
                      <td className="p-3 text-sm text-right text-success">+₹{(s.amount_paise / 100).toFixed(2)}</td>
                      <td className="p-3 text-sm text-text-secondary truncate max-w-[200px]">{s.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-bg-elevated border border-border-subtle rounded-md p-6 w-full max-w-[480px] shadow-lg">
            <h2 className="text-md font-semibold mb-4">Record Payment</h2>
            
            {formError && <div className="mb-4 p-3 bg-error-subtle border-l-2 border-error text-error text-sm">{formError}</div>}

            <form onSubmit={handleRecordPayment} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Who paid</label>
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
                  <label className="text-sm font-medium">Who to</label>
                  <select
                    className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                    value={paidTo}
                    onChange={e => setPaidTo(e.target.value)}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-secondary">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared March dues"
                  className="bg-bg-input border border-border-default focus:border-border-focus rounded-base p-2 text-sm outline-none transition-colors"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-surface border border-border-default rounded-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-text-inverse rounded-base transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
