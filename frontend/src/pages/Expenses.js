import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function Expenses() {
  const { id: groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadExpenses() {
      try {
        const data = await fetchApi(`/api/groups/${groupId}/expenses`);
        setExpenses(data.expenses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExpenses();
  }, [groupId]);

  if (loading) return <div className="p-8 text-text-secondary">Loading expenses...</div>;
  if (error) return <div className="p-8 text-error">{error}</div>;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[1100px] mx-auto">
        <Link to={`/groups/${groupId}`} className="text-accent text-sm hover:underline mb-4 inline-block">
          &larr; Back to Group
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Expenses</h1>
          <Link 
            to={`/groups/${groupId}/expenses/new`}
            className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 text-sm font-medium rounded-base transition-colors"
          >
            + Add Expense
          </Link>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated border-b border-border-subtle">
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Date</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Description</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Paid By</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium text-right">Amount</th>
                  <th className="p-3 text-xs uppercase tracking-wider text-text-secondary font-medium">Split</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm text-text-tertiary">
                      No expenses yet. <br />
                      <Link to={`/groups/${groupId}/expenses/new`} className="text-accent mt-2 inline-block">Add the first expense</Link>
                    </td>
                  </tr>
                ) : (
                  expenses.map(expense => (
                    <tr key={expense.id} className="border-b border-border-subtle hover:bg-bg-elevated transition-colors cursor-pointer">
                      <td className="p-3 text-sm text-text-secondary">
                        {new Date(expense.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                      </td>
                      <td className="p-3 text-sm">{expense.description}</td>
                      <td className="p-3 text-sm text-text-secondary">{expense.paid_by_user?.name || 'Unknown'}</td>
                      <td className="p-3 text-sm text-right">₹{(expense.amount_paise / 100).toFixed(2)}</td>
                      <td className="p-3 text-sm text-text-secondary capitalize">{expense.split_type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
