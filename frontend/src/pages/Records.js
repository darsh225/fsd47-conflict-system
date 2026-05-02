import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecords, createRecord, deleteRecord } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRecord, setNewRecord] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data.records);
    } catch (err) {
      setError('Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await createRecord(newRecord);
      setNewRecord({ title: '', content: '' });
      setShowCreate(false);
      fetchRecords();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create record.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      setRecords(records.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Shared Records</h1>
          <p className="page-subtitle">// {records.length} record(s) — click to edit</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Record
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-text">No records yet.{user?.role === 'admin' ? ' Create one above.' : ' Ask an admin to create records.'}</div>
        </div>
      ) : (
        records.map(record => (
          <div key={record._id} className="record-card" onClick={() => navigate(`/records/${record._id}/edit`)}>
            <div className="record-card-header">
              <div className="record-title">{record.title}</div>
              <div className="record-version">v{record.version}</div>
            </div>
            <div className="record-content" style={{ maxHeight: 80, overflow: 'hidden' }}>
              {record.content}
            </div>
            <div className="record-meta">
              Updated by <strong>{record.lastUpdatedByUsername}</strong> · {formatDate(record.updatedAt)}
            </div>
            {user?.role === 'admin' && (
              <div className="record-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => handleDelete(record._id, e)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Create Record Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Record</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            {createError && <div className="alert alert-error">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRecord.title}
                  onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                  placeholder="Record title"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-textarea"
                  value={newRecord.content}
                  onChange={e => setNewRecord({ ...newRecord, content: e.target.value })}
                  placeholder="Record content..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Record'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
