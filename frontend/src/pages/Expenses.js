import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowLeft } from 'react-icons/fi';

export default function Expenses() {
  const { id: groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupData, expensesData, authData] = await Promise.all([
          fetchApi(`/api/groups/${groupId}`),
          fetchApi(`/api/groups/${groupId}/expenses`),
          fetchApi('/api/auth/me')
        ]);
        setGroup(groupData.group);
        setExpenses(expensesData.expenses);
        setIsAdmin(authData.user?.role === 'admin');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full mt-4">
        <div className="flex flex-col">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 bg-border-default/30 rounded"></div>
              <div className="h-8 w-64 bg-border-default/40 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-border-default/30 rounded"></div>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden mt-2">
            <div className="divide-y divide-border-subtle">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center px-4 py-4 gap-6">
                  <div className="h-6 w-24 bg-border-default/40 rounded"></div>
                  <div className="h-6 w-1/3 bg-border-default/30 rounded"></div>
                  <div className="h-6 w-32 bg-border-default/30 rounded"></div>
                  <div className="h-6 w-20 bg-border-default/30 rounded ml-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-error">{error}</div>;

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{group?.name} Expenses</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/groups/${groupId}`} 
              className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
            >
              <FiArrowLeft size={16} /> Back to Group
            </Link>
            {!isAdmin && (
              <Link 
                to={`/groups/${groupId}/expenses/new`}
                className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 text-sm font-medium rounded transition-colors flex items-center"
              >
                + Add Expense
              </Link>
            )}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-border-subtle">
              {expenses.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-sm text-text-secondary capitalize">
                    No expenses yet<br />
                    {!isAdmin && (
                      <Link to={`/groups/${groupId}/expenses/new`} className="text-accent mt-2 inline-block">Add the first expense</Link>
                    )}
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="transition-colors group hover:bg-bg-elevated">
                    <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap w-32">
                      {new Date(expense.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                    </td>
                    <td className="px-4 py-4 align-middle w-1/3">
                      <span className="font-semibold text-text-primary text-base">{expense.description}</span>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap">
                      Paid by: {expense.paid_by_user?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-text-primary whitespace-nowrap text-right font-medium">
                      ₹{(expense.amount_paise / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap text-right w-24">
                      <span className="capitalize px-2 py-1 bg-bg-base border border-border-default rounded text-xs">{expense.split_type}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
