import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

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

  if (loading) return <div className="p-8 text-text-secondary">Loading report...</div>;
  if (error) return <div className="p-8 text-error">{error}</div>;

  const rejectedCount = anomalies.filter(a => a.resolution === 'rejected').length;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold mb-2">Import Report</h1>
            <p className="text-text-secondary text-sm">
              {batch.filename} &nbsp;•&nbsp; Finalized {new Date(batch.finalized_at || batch.created_at).toLocaleDateString()}
            </p>
          </div>
          <Link to="/dashboard" className="bg-transparent border border-border-default hover:border-border-focus px-4 py-2 text-sm font-medium rounded-base transition-colors">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-base">
            <div className="text-xl font-semibold mb-1">{batch.total_rows}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Total Rows</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-base">
            <div className="text-xl font-semibold text-success mb-1">{batch.clean_rows}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Clean Rows</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-base">
            <div className="text-xl font-semibold text-warning mb-1">{batch.anomaly_rows}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Anomalies Detected</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-base">
            <div className="text-xl font-semibold text-error mb-1">{rejectedCount}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Rows Rejected</div>
          </div>
        </div>

        <h2 className="text-md font-semibold mb-4">Anomaly Log</h2>
        <div className="bg-bg-surface border border-border-subtle rounded-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated border-b border-border-subtle">
                  <th className="p-3 text-xs uppercase text-text-secondary font-medium">Row</th>
                  <th className="p-3 text-xs uppercase text-text-secondary font-medium">Type</th>
                  <th className="p-3 text-xs uppercase text-text-secondary font-medium">Action Taken</th>
                  <th className="p-3 text-xs uppercase text-text-secondary font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map(a => (
                  <tr key={a.id} className="border-b border-border-subtle hover:bg-bg-elevated transition-colors">
                    <td className="p-3 text-sm text-text-secondary">{a.row_number}</td>
                    <td className="p-3 text-sm">{a.anomaly_type}</td>
                    <td className="p-3 text-sm text-text-secondary truncate max-w-[300px]">
                      {a.severity === 'INFO' ? `${a.anomaly_detail} ${a.suggested_action}` : a.suggested_action}
                    </td>
                    <td className="p-3 text-sm">
                      {a.resolution === 'approved' && <span className="text-success text-xs font-semibold uppercase tracking-wide">Approved</span>}
                      {a.resolution === 'rejected' && <span className="text-error text-xs font-semibold uppercase tracking-wide">Rejected</span>}
                      {a.resolution === 'pending' && <span className="text-warning text-xs font-semibold uppercase tracking-wide">Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
