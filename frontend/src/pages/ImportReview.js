import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowLeft } from 'react-icons/fi';

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

  if (loading) {
    return (
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full mt-4">
        <div className="h-10 w-48 bg-border-default/30 rounded mb-8"></div>
        <div className="h-20 w-full bg-border-default/30 rounded mb-8"></div>
        <div className="h-32 w-full bg-border-default/30 rounded mb-4"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-error">{error}</div>;
  if (!batch) return <div className="p-8 text-text-secondary">Batch not found</div>;

  const blocking = anomalies.filter(a => a.severity === 'BLOCKING');
  const info = anomalies.filter(a => a.severity === 'INFO');

  const pendingCount = blocking.filter(a => a.resolution === 'pending').length;
  const resolvedCount = anomalies.length - pendingCount;

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              to="/import" 
              className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
            >
              <FiArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Import
            </Link>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Review Anomalies</h1>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded mb-8 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-lg">{anomalies.length}</span> anomalies total &nbsp;|&nbsp; 
            <span className="text-success ml-2">{resolvedCount}</span> resolved &nbsp;|&nbsp; 
            <span className="text-warning font-semibold ml-2">{pendingCount}</span> pending
          </div>
          <button
            onClick={handleFinalize}
            disabled={pendingCount > 0 || finalizing}
            className="bg-accent hover:opacity-90 text-text-inverse px-6 py-2.5 rounded text-sm font-medium transition-opacity disabled:opacity-50"
          >
            {finalizing ? 'Finalizing...' : 'Finalize Import'}
          </button>
        </div>

        {blocking.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-error border-b border-error/20 pb-2">Action Required ({pendingCount} pending)</h2>
            <div className="flex flex-col gap-4">
              {blocking.map(a => (
                <div key={a.id} className="bg-bg-surface border border-border-subtle rounded p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-1 rounded-sm uppercase tracking-wide mr-3 border border-error/20">Row {a.row_number}</span>
                      <span className="font-semibold text-lg">{a.anomaly_type}</span>
                    </div>
                    {a.resolution === 'approved' && <span className="text-xs font-bold text-success bg-success/10 border border-success/20 px-3 py-1 rounded uppercase tracking-wide">Approved ✓</span>}
                    {a.resolution === 'rejected' && <span className="text-xs font-bold text-text-secondary bg-border-subtle px-3 py-1 rounded uppercase tracking-wide">Rejected ✗</span>}
                    {a.resolution === 'pending' && <span className="text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded uppercase tracking-wide">Pending Action</span>}
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-2 bg-bg-elevated p-3 rounded">{a.anomaly_detail}</p>
                  <p className="text-sm text-accent font-medium mb-4 flex items-center gap-2">↳ Suggested Fix: {a.suggested_action}</p>
                  
                  <div className="bg-bg-base border border-border-subtle p-3 rounded overflow-x-auto mb-4">
                    <pre className="text-xs text-text-secondary font-mono">{JSON.stringify(a.raw_row, null, 2)}</pre>
                  </div>

                  {a.resolution === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleResolve(a.id, 'approved')} className="text-sm font-semibold px-4 py-2 bg-success/10 text-success hover:bg-success/20 border border-success/20 rounded transition-colors">
                        ✓ Accept Suggestion
                      </button>
                      <button onClick={() => handleResolve(a.id, 'rejected')} className="text-sm font-semibold px-4 py-2 bg-bg-base border border-border-default text-text-secondary hover:bg-border-subtle rounded transition-colors">
                        ✗ Reject Entire Row
                      </button>
                    </div>
                  )}
                  {a.resolution !== 'pending' && (
                    <button onClick={() => handleResolve(a.id, 'pending')} className="text-xs text-text-tertiary hover:text-text-primary underline mt-2 transition-colors">
                      Undo this decision
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {info.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-text-primary border-b border-border-subtle pb-2">Auto-corrected Minor Anomalies</h2>
            <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-border-subtle">
                  {info.map(a => (
                    <tr key={a.id} className="transition-colors group hover:bg-bg-elevated">
                      <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap w-24">Row {a.row_number}</td>
                      <td className="px-4 py-4 align-middle text-sm font-semibold text-text-primary w-1/4">{a.anomaly_type}</td>
                      <td className="px-4 py-4 align-middle text-sm text-text-secondary">{a.anomaly_detail} <span className="text-accent ml-2">{a.suggested_action}</span></td>
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
