import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ImportReport() {
  const { batch_id } = useParams();
  const [batch, setBatch] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchApi(`/api/import/${batch_id}`);
        setBatch(data.batch);
        setAnomalies(data.anomalies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [batch_id]);

  if (loading) {
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full mt-4">
        <div className="h-10 w-48 bg-border-default/30 rounded mb-8"></div>
        <div className="h-32 w-full bg-border-default/30 rounded mb-8"></div>
        <div className="h-64 w-full bg-border-default/30 rounded mb-4"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-error">{error}</div>;

  const rejectedCount = anomalies.filter(a => a.resolution === 'rejected').length;

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Import Report</h1>
            <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded text-sm font-semibold flex items-center gap-2">
              <FiCheckCircle /> Finalized {new Date(batch.finalized_at || batch.created_at).toLocaleDateString()}
            </span>
          </div>
          <Link 
            to="/dashboard" 
            className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
          >
            <FiArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold mb-1 text-text-primary">{batch.total_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Total Rows Processed</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-success mb-1">{batch.clean_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Clean Rows Imported</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-warning mb-1">{batch.anomaly_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Anomalies Detected</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-error mb-1">{rejectedCount}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Rows Rejected</div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 border-b border-border-subtle pb-2">Full Resolution Log</h2>
        <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-border-subtle">
              {anomalies.map(a => (
                <tr key={a.id} className="transition-colors group hover:bg-bg-elevated">
                  <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap w-24 font-medium">Row {a.row_number}</td>
                  <td className="px-4 py-4 align-middle text-sm font-semibold text-text-primary w-1/4">{a.anomaly_type}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-secondary max-w-[400px]">
                    {a.severity === 'INFO' ? `${a.anomaly_detail} ${a.suggested_action}` : a.suggested_action}
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-right w-32">
                    {a.resolution === 'approved' && <span className="text-success text-xs font-bold bg-success/10 border border-success/20 px-3 py-1.5 rounded uppercase tracking-wide">Approved</span>}
                    {a.resolution === 'rejected' && <span className="text-error text-xs font-bold bg-error/10 border border-error/20 px-3 py-1.5 rounded uppercase tracking-wide">Rejected</span>}
                    {a.resolution === 'pending' && <span className="text-warning text-xs font-bold bg-warning/10 border border-warning/20 px-3 py-1.5 rounded uppercase tracking-wide">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
