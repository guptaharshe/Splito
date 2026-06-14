import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function ImportReview() {
  const { batch_id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [batch_id]);

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

  const handleResolve = async (id, resolution) => {
    try {
      await fetchApi(`/api/import/${batch_id}/anomalies/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ resolution })
      });
      // Refresh
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await fetchApi(`/api/import/${batch_id}/finalize`, { method: 'POST' });
      navigate(`/import/${batch_id}/report`);
    } catch (err) {
      setError(err.message);
      setFinalizing(false);
    }
  };

  if (loading) return <div className="p-8 text-text-secondary">Loading review...</div>;
  if (error) return <div className="p-8 text-error">{error}</div>;
  if (!batch) return <div className="p-8 text-text-secondary">Batch not found</div>;

  const blocking = anomalies.filter(a => a.severity === 'BLOCKING');
  const info = anomalies.filter(a => a.severity === 'INFO');

  const pendingCount = blocking.filter(a => a.resolution === 'pending').length;
  const resolvedCount = anomalies.length - pendingCount;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">Import Review</h1>
          <p className="text-text-secondary text-sm">Resolve all blocking anomalies before finalizing.</p>
        </div>

        <div className="bg-bg-elevated border border-border-subtle p-4 rounded-base mb-8 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">{anomalies.length}</span> anomalies &nbsp;|&nbsp; 
            <span className="text-success ml-2">{resolvedCount}</span> resolved &nbsp;|&nbsp; 
            <span className="text-warning ml-2">{pendingCount}</span> pending
          </div>
          <button
            onClick={handleFinalize}
            disabled={pendingCount > 0 || finalizing}
            className="bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 rounded-base text-sm font-medium transition-colors disabled:opacity-50"
          >
            {finalizing ? 'Finalizing...' : 'Finalize Import'}
          </button>
        </div>

        {blocking.length > 0 && (
          <div className="mb-12">
            <h2 className="text-md font-semibold mb-4 text-error">BLOCKING ANOMALIES</h2>
            <div className="flex flex-col gap-4">
              {blocking.map(a => (
                <div key={a.id} className="bg-bg-surface border border-border-subtle rounded-base p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-medium text-error bg-error-subtle px-2 py-1 rounded-sm uppercase tracking-wide mr-3">Row {a.row_number}</span>
                      <span className="font-semibold">{a.anomaly_type}</span>
                    </div>
                    {a.resolution === 'approved' && <span className="text-xs text-success bg-success-subtle px-2 py-1 rounded-sm uppercase tracking-wide">Approved ✓</span>}
                    {a.resolution === 'rejected' && <span className="text-xs text-text-secondary bg-border-subtle px-2 py-1 rounded-sm uppercase tracking-wide">Rejected ✗</span>}
                    {a.resolution === 'pending' && <span className="text-xs text-warning bg-warning-subtle px-2 py-1 rounded-sm uppercase tracking-wide">Pending</span>}
                  </div>
                  
                  <p className="text-sm mb-2">{a.anomaly_detail}</p>
                  <p className="text-sm text-accent mb-4">Suggested: {a.suggested_action}</p>
                  
                  <div className="bg-bg-input p-3 rounded-base overflow-x-auto mb-4">
                    <pre className="text-xs text-text-secondary font-mono">{JSON.stringify(a.raw_row, null, 2)}</pre>
                  </div>

                  {a.resolution === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleResolve(a.id, 'approved')} className="text-xs font-medium px-4 py-2 bg-success-subtle text-success hover:bg-success/20 rounded-base">
                        ✓ Approve Suggestion
                      </button>
                      <button onClick={() => handleResolve(a.id, 'rejected')} className="text-xs font-medium px-4 py-2 bg-border-subtle text-text-secondary hover:bg-border-default rounded-base">
                        ✗ Reject Row
                      </button>
                    </div>
                  )}
                  {a.resolution !== 'pending' && (
                    <button onClick={() => handleResolve(a.id, 'pending')} className="text-xs text-text-tertiary underline mt-2">
                      Undo decision
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {info.length > 0 && (
          <div>
            <h2 className="text-md font-semibold mb-4 text-text-secondary">INFO ANOMALIES (Auto-handled)</h2>
            <div className="bg-bg-surface border border-border-subtle rounded-base overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-elevated border-b border-border-subtle">
                    <th className="p-3 text-xs uppercase text-text-secondary">Row</th>
                    <th className="p-3 text-xs uppercase text-text-secondary">Type</th>
                    <th className="p-3 text-xs uppercase text-text-secondary">Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {info.map(a => (
                    <tr key={a.id} className="border-b border-border-subtle">
                      <td className="p-3 text-sm text-text-secondary">{a.row_number}</td>
                      <td className="p-3 text-sm">{a.anomaly_type}</td>
                      <td className="p-3 text-sm text-text-secondary">{a.anomaly_detail} {a.suggested_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
