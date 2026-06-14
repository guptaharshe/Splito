import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { FiArrowRight, FiUploadCloud } from 'react-icons/fi';

export default function History() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchApi('/api/import/history');
        setBatches(data.batches || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
            Import History
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden mt-2 animate-pulse">
          <div className="divide-y divide-border-subtle">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center px-4 py-4 gap-6">
                <div className="h-6 w-1/4 bg-border-default/40 rounded"></div>
                <div className="h-6 w-24 bg-border-default/30 rounded"></div>
                <div className="h-6 w-1/3 bg-border-default/30 rounded"></div>
                <div className="h-6 w-32 bg-border-default/30 rounded ml-auto"></div>
                <div className="h-6 w-6 bg-border-default/30 rounded shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      ) : batches.length > 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded overflow-hidden mt-2">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-border-subtle">
              {batches.map(b => {
                const displayFilename = b.filename.includes('|') ? b.filename.split('|')[1] : b.filename;
                return (
                <tr key={b.id} className="transition-colors group hover:cursor-pointer" onClick={() => navigate(`/history/${b.id}/report`)}>
                  <td className="px-4 py-3 align-middle">
                    <span className="font-semibold text-text-primary text-base group-hover:underline">{displayFilename}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap align-middle">
                    <div className="flex items-center gap-1.5">
                      <FiUploadCloud size={16} /> <span>{b.total_rows} Rows Processed</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary w-1/3 align-middle">
                    <span className="line-clamp-1 capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${b.status === 'finalized' ? 'bg-success' : 'bg-warning'}`}></span>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap align-middle">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center align-middle w-12">
                    <FiArrowRight size={16} className="text-text-secondary group-hover:text-text-primary transition-colors inline-block" />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-default border-dashed rounded-md p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
            <FiUploadCloud className="text-2xl text-text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">No Past Imports</h2>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            You haven't imported any CSV files yet.
          </p>
        </div>
      )}
    </div>
  );
}
