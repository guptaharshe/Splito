import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export default function ImportReview() {
  const { batch_id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [resolvingStatus, setResolvingStatus] = useState(null); // { id, action }

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
    setResolvingStatus({ id, action: resolution });
    try {
      await fetchApi(`/api/import/${batch_id}/anomalies/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ resolution })
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setResolvingStatus(null);
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
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full">
        <div className="flex flex-col">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Review Anomalies</h1>
            </div>
            <Link
              to="/import"
              className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group pointer-events-none"
            >
              <FiArrowLeft size={16} /> Back to Import
            </Link>
          </div>

          <div className="bg-bg-surface border border-border-subtle p-6 rounded mb-8 flex items-center justify-between">
            <div className="h-6 w-64 bg-border-default/40 rounded"></div>
            <div className="h-9 w-32 bg-border-default/40 rounded"></div>
          </div>

          <div className="mb-12">
            <div className="h-7 w-48 bg-border-default/40 rounded mb-4 border-b border-border-default/20 pb-2"></div>
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-bg-surface border border-border-subtle p-6 rounded flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-40 bg-border-default/40 rounded"></div>
                    <div className="h-6 w-24 bg-border-default/30 rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-border-default/30 rounded mt-2"></div>
                  <div className="h-6 w-1/2 bg-border-default/30 rounded"></div>
                  <div className="h-16 w-full bg-border-default/20 rounded mt-2"></div>
                  <div className="flex justify-end gap-3 mt-4">
                    <div className="h-9 w-24 bg-border-default/40 rounded"></div>
                    <div className="h-9 w-24 bg-border-default/40 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-error">{error}</div>;
  if (!batch) return <div className="p-8 text-text-secondary">Batch not found</div>;

  const blocking = anomalies.filter(a => a.severity === 'BLOCKING');
  const info = anomalies.filter(a => a.severity === 'INFO');

  const pendingCount = blocking.filter(a => a.resolution === 'pending').length;
  const resolvedCount = anomalies.length - pendingCount;
  const affectedRows = new Set(anomalies.map(a => a.row_number)).size;

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Review Anomalies</h1>
          </div>
          <Link
            to="/import"
            className="bg-text-primary text-bg-base px-4 py-2 text-sm font-medium rounded transition-opacity flex items-center gap-2 group"
          >
            <FiArrowLeft size={16} /> Back to Import
          </Link>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded mb-8 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-lg">{anomalies.length}</span> anomaly records &nbsp;|&nbsp;
            <span className="text-text-primary font-medium ml-2">{affectedRows}</span> affected rows &nbsp;|&nbsp;
            <span className="text-success ml-2">{resolvedCount}</span> reviewed &nbsp;|&nbsp;
            <span className="text-warning font-semibold ml-2">{pendingCount}</span> pending
          </div>
          <button
            onClick={handleFinalize}
            disabled={pendingCount > 0 || finalizing}
            className="bg-accent flex items-center justify-center gap-2 text-text-inverse px-4 py-2 rounded text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {finalizing ? 'Finalizing...' : 'Finalize Import'}
            {!finalizing && <FiArrowRight size={16} />}
          </button>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded p-5 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-2">How to review these anomalies</h2>
          <p className="text-sm text-text-secondary leading-6">
            A single CSV row can produce more than one anomaly record. Use <span className="text-success font-medium">Accept Suggestion</span> when the proposed fix is correct and the row should stay in the import, or <span className="text-error font-medium">Reject Entire Row</span> when the row should be excluded from the final import.
          </p>
        </div>

        {blocking.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-error border-b-2 border-error/80 pb-2">Action Required ({pendingCount} pending)</h2>
            <div className="flex flex-col gap-4">
              {blocking.map(a => (
                <div key={a.id} className="bg-bg-surface border border-border-subtle rounded p-4 transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-lg font-semibold text-error mr-3">Row {a.row_number}:</span>
                      <span className="font-semibold text-lg">{a.anomaly_type}</span>
                    </div>
                    {a.resolution === 'approved' && <span className="text-sm bg-success font-medium text-text-inverse px-3 py-0.5 rounded">Approved</span>}
                    {a.resolution === 'rejected' && <span className="text-sm bg-error font-medium text-text-inverse px-3 py-0.5 rounded">Rejected</span>}
                    {a.resolution === 'pending' && <span className="text-sm bg-warning font-medium text-text-inverse px-3 py-0.5 rounded">Pending</span>}
                  </div>

                  <p className="text-sm text-text-primary mb-2 bg-bg-base p-3 rounded">{a.anomaly_detail}</p>
                  <p className="text-sm text-accent font-medium mb-4 flex items-center gap-2">↳ Suggested Fix: {a.suggested_action}</p>

                  <div className="bg-bg-base border border-border-subtle p-3 rounded overflow-x-auto mb-4">
                    <pre className="text-xs text-text-primary font-mono">{JSON.stringify(a.raw_row, null, 2)}</pre>
                  </div>

                  {a.resolution === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResolve(a.id, 'approved')}
                        disabled={resolvingStatus?.id === a.id}
                        className="text-sm font-medium px-4 py-2 bg-success text-text-inverse rounded transition-colors disabled:opacity-70 disabled:cursor-wait"
                      >
                        {resolvingStatus?.id === a.id && resolvingStatus.action === 'approved' ? 'Accepting...' : '✓ Accept Suggestion'}
                      </button>
                      <button
                        onClick={() => handleResolve(a.id, 'rejected')}
                        disabled={resolvingStatus?.id === a.id}
                        className="text-sm font-medium px-4 py-2 bg-error text-text-inverse rounded transition-colors disabled:opacity-70 disabled:cursor-wait"
                      >
                        {resolvingStatus?.id === a.id && resolvingStatus.action === 'rejected' ? 'Rejecting...' : '✗ Reject Entire Row'}
                      </button>
                    </div>
                  )}
                  {a.resolution !== 'pending' && (
                    <div className="flex justify-start">
                      <button
                        onClick={() => handleResolve(a.id, 'pending')}
                        disabled={resolvingStatus?.id === a.id}
                        className="text-xs font-medium px-3 py-1.5 bg-black text-white rounded transition-colors disabled:opacity-70 disabled:cursor-wait"
                      >
                        {resolvingStatus?.id === a.id && resolvingStatus.action === 'pending' ? 'Undoing...' : 'Undo Action'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {info.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-text-primary border-b border-border-subtle pb-2">Auto-Corrected Minor Anomalies</h2>
            <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-border-subtle">
                  {info.map(a => (
                    <tr key={a.id} className="transition-colors group">
                      <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap w-24">Row {a.row_number}</td>
                      <td className="px-4 py-4 align-middle text-sm font-semibold text-text-primary w-1/4">{a.anomaly_type}</td>
                      <td className="px-4 py-4  text-sm text-text-secondary">{a.anomaly_detail}</td>
                      <td className="px-4 py-4 align-middle text-sm font-medium text-accent text-right">{a.suggested_action}</td>
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
