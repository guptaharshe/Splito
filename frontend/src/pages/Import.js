import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Import() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid .csv file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('supabase_token');
      const res = await fetch('http://localhost:3001/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload file');

      // Navigate to review page
      navigate(`/import/${data.batch.id}/review`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-8">
      <div className="max-w-[800px] mx-auto">
        <Link to="/dashboard" className="text-accent text-sm hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-lg font-semibold">Import Expenses</h1>
          <p className="text-text-secondary text-sm">Upload the expenses_export.csv file to import historical data.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-error-subtle border-l-2 border-error text-error text-sm">{error}</div>}

        <div className="bg-bg-surface border border-border-subtle border-dashed rounded-base p-12 flex flex-col items-center justify-center mb-6 relative">
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="text-center">
              <span className="text-success font-medium flex items-center gap-2">
                ✓ {file.name}
              </span>
              <p className="text-xs text-text-tertiary mt-2">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Drop CSV file here, or click to browse</p>
              <p className="text-xs text-text-tertiary">Only .csv files accepted</p>
            </div>
          )}
        </div>

        {file && (
          <button 
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-text-inverse py-3 rounded-base text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing File...' : 'Analyze File'}
          </button>
        )}
      </div>
    </div>
  );
}
