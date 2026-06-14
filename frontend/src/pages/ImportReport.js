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
      <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-pulse w-full">
        <div className="flex flex-col">
          <div className="mb-8 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Import Report</h1>
              <div className="h-5 w-32 bg-border-default/40 rounded mt-1"></div>
            </div>
            <div className="h-9 w-40 bg-border-default/40 rounded"></div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-bg-surface border border-border-subtle p-6 rounded h-[116px]"></div>
            <div className="bg-bg-surface border border-border-subtle p-6 rounded h-[116px]"></div>
            <div className="bg-bg-surface border border-border-subtle p-6 rounded h-[116px]"></div>
            <div className="bg-bg-surface border border-border-subtle p-6 rounded h-[116px]"></div>
          </div>

          <div className="h-7 w-48 bg-border-default/40 rounded mb-4 border-b border-border-subtle pb-2"></div>
          
          <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
            <div className="h-14 w-full border-b border-border-subtle bg-bg-elevated/50"></div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 w-full border-b border-border-subtle bg-transparent"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-error">{error}</div>;

  const rejectedCount = anomalies.filter(a => a.resolution === 'rejected').length;
  const autoFixedCount = anomalies.filter(a => a.severity === 'INFO').length;
  const blockedCount = anomalies.filter(a => a.severity === 'BLOCKING').length;
  const affectedRows = new Set(anomalies.map(a => a.row_number)).size;

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Import Report</h1>
            <span className="text-text-secondary text-md font-medium flex items-center gap-2">
              Finalized {new Date(batch.finalized_at || batch.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded p-5 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-2">How to read this report</h2>
          <p className="text-sm text-text-secondary leading-6">
            <span className="text-text-primary font-medium">{batch.total_rows} total rows</span> were scanned.{' '}
            <span className="text-success font-medium">{batch.clean_rows} rows</span> imported with no anomalies,{' '}
            <span className="text-warning font-medium">{batch.anomaly_rows} anomaly records</span> were detected across{' '}
            <span className="text-text-primary font-medium">{affectedRows} affected rows</span>, and{' '}
            <span className="text-error font-medium">{rejectedCount} rows</span> were rejected after review.{' '}
            One row can have more than one anomaly record, which is why anomaly records and row counts are different.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold mb-1 text-text-primary">{batch.total_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wide">Total Rows Processed</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-success mb-1">{batch.clean_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wide">Clean Rows Imported</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-warning mb-1">{batch.anomaly_rows}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wide">Anomaly Records Detected</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-6 rounded shadow-sm">
            <div className="text-3xl font-bold text-error mb-1">{rejectedCount}</div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wide">Rows Rejected</div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 border-b border-border-subtle pb-2">Full Resolution Log</h2>
        <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-elevated/50">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-text-secondary font-semibold">Row</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-text-secondary font-semibold">Anomaly</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-text-secondary font-semibold">Explanation</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-text-secondary font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {anomalies.map(a => (
                <tr key={a.id} className="transition-colors">
                  <td className="px-4 py-4 align-middle text-sm text-text-secondary whitespace-nowrap w-24 font-medium">Row {a.row_number}</td>
                  <td className="px-4 py-4 align-middle text-sm font-semibold text-text-primary w-1/4">{a.anomaly_type}</td>
                  <td className="px-4 py-4 align-middle text-sm text-text-secondary max-w-[400px]">
                    {a.severity === 'INFO' ? `${a.anomaly_detail} ${a.suggested_action}` : a.suggested_action}
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-right w-32">
                    {a.severity === 'INFO' ? (
                      <span className="inline-block w-28 text-center text-text-inverse text-xs font-medium bg-blue-600 border px-3 py-1.5 rounded uppercase">Auto-Fixed</span>
                    ) : (
                      <>
                        {a.resolution === 'approved' && <span className="inline-block w-28 text-center text-text-inverse text-xs font-medium bg-success border px-3 py-1.5 rounded uppercase">Approved</span>}
                        {a.resolution === 'rejected' && <span className="inline-block w-28 text-center text-text-inverse text-xs font-medium bg-error border px-3 py-1.5 rounded uppercase">Rejected</span>}
                        {a.resolution === 'pending' && <span className="inline-block w-28 text-center text-text-inverse text-xs font-medium bg-warning border px-3 py-1.5 rounded uppercase">Pending</span>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-surface border border-border-subtle rounded p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">Auto-fixed records</p>
            <p className="text-2xl font-bold text-text-primary">{autoFixedCount}</p>
            <p className="text-sm text-text-secondary mt-1">Safe corrections like currency conversion, amount cleanup, and case normalization.</p>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">Blocking records</p>
            <p className="text-2xl font-bold text-text-primary">{blockedCount}</p>
            <p className="text-sm text-text-secondary mt-1">These need explicit review before the row can be imported.</p>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">Affected rows</p>
            <p className="text-2xl font-bold text-text-primary">{affectedRows}</p>
            <p className="text-sm text-text-secondary mt-1">Some rows generate multiple anomaly records, so this number can be smaller than the anomaly total.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
