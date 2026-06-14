import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud } from 'react-icons/fi';
import { fetchApi } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function Import() {
  const [file, setFile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await fetchApi('/api/groups');
        setGroups(data.groups || []);
        if (data.groups && data.groups.length > 0) {
          setSelectedGroup(data.groups[0].id);
        }
      } catch (err) {
        setError("Failed to load groups for selection.");
      } finally {
        setFetchingGroups(false);
      }
    }
    loadGroups();
  }, []);

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
    if (!file || !selectedGroup) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('groupId', selectedGroup);
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('http://localhost:3001/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload file');

      navigate(`/import/${data.batch.id}/review`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-2 max-w-7xl mx-auto flex flex-col animate-fade-in w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Import Expenses</h1>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded p-8">
          <p className="text-text-secondary text-sm mb-6">Upload the Expenses_Export.csv file. The engine will automatically parse rows, detect anomalies, and cross-reference dates against the selected group's timeline.</p>

          {error && <div className="mb-4 px-3 py-2 bg-error text-text-inverse text-sm rounded">{error}</div>}

          {fetchingGroups ? (
            <div className="mb-6 animate-pulse">
              <div className="h-4 w-40 bg-border-default/40 rounded mb-3"></div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border-default/40 rounded-full"></div>
                  <div className="h-4 w-20 bg-border-default/40 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border-default/40 rounded-full"></div>
                  <div className="h-4 w-24 bg-border-default/40 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-3">Select Target Group <span className='text-error'>*</span></label>
              <div className="flex flex-wrap gap-6">
                {groups.map(g => (
                  <label 
                    key={g.id} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      name="targetGroup" 
                      value={g.id}
                      checked={selectedGroup === g.id}
                      onChange={() => setSelectedGroup(g.id)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#000' }}
                    />
                    <span className="text-sm text-text-primary">
                      {g.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-border-default border-dashed rounded p-16 flex flex-col items-center justify-center mb-6 relative hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="text-center">
                <span className="text-success font-medium flex items-center gap-2 justify-center text-lg">
                  {file.name}
                </span>
                <p className="text-sm text-text-tertiary mt-2">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <FiUploadCloud size={48} className="text-text-tertiary mb-4" />
                <p className="text-base font-medium text-text-primary mb-1">Drop CSV file here, or click to browse</p>
                <p className="text-sm text-text-tertiary">Only .csv files accepted</p>
              </div>
            )}
          </div>

          {file && selectedGroup && (
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-accent hover:opacity-90 text-text-inverse py-3 rounded text-sm font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Analyzing File...' : 'Analyze CSV & Detect Anomalies'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
