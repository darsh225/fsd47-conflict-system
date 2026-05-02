import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecord, updateRecord } from '../api';

export default function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [clientVersion, setClientVersion] = useState(null); // version when user loaded the record
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [conflict, setConflict] = useState(null); // conflict details from server

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await getRecord(id);
        const rec = res.data.record;
        setRecord(rec);
        setForm({ title: rec.title, content: rec.content });
        setClientVersion(rec.version); // lock the version user sees
      } catch (err) {
        setError('Failed to load record.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setConflict(null);
    setSaving(true);

    try {
      // Send clientVersion along with the update — backend checks this
      const res = await updateRecord(id, {
        title: form.title,
        content: form.content,
        clientVersion // critical: the version we loaded
      });

      const updatedRecord = res.data.record;
      setRecord(updatedRecord);
      setClientVersion(updatedRecord.version); // update local version after successful save
      setForm({ title: updatedRecord.title, content: updatedRecord.content });
      setSuccess('Record updated successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        // CONFLICT DETECTED
        setConflict(err.response.data.conflict);
      } else {
        setError(err.response?.data?.message || 'Update failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    // Reload latest from server — user must re-read before retrying
    setConflict(null);
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await getRecord(id);
      const rec = res.data.record;
      setRecord(rec);
      setForm({ title: rec.title, content: rec.content });
      setClientVersion(rec.version);
    } catch (err) {
      setError('Failed to refresh record.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading record...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Edit Record</h1>
          <p className="page-subtitle">
            // id: {id.slice(-8)} · current version: v{record?.version}
            {clientVersion !== record?.version && (
              <span style={{ color: 'var(--warning)', marginLeft: 8 }}>[stale — refresh!]</span>
            )}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/records')}>← Back</button>
      </div>

      {/* CONFLICT ALERT — most important UI element */}
      {conflict && (
        <div className="conflict-alert">
          <div className="conflict-alert-title">
            ⚠ CONFLICT DETECTED — Update Rejected
          </div>
          <div className="conflict-alert-body">
            <p>This record was modified by another user while you were editing it. Your changes were <strong>not saved</strong>.</p>
            <br />
            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-dim)', paddingRight: 12, paddingBottom: 6 }}>Your version</td>
                  <td className="conflict-detail">v{conflict.yourVersion}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-dim)', paddingRight: 12, paddingBottom: 6 }}>Current server version</td>
                  <td className="conflict-detail">v{conflict.currentVersion}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-dim)', paddingRight: 12, paddingBottom: 6 }}>Last updated by</td>
                  <td className="conflict-detail">{conflict.lastUpdatedBy}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-dim)', paddingRight: 12 }}>Updated at</td>
                  <td className="conflict-detail">{new Date(conflict.lastUpdatedAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <br />
            <p style={{ marginBottom: '0.8rem' }}>You must refresh to see the latest version before retrying your edit.</p>
            <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
              Refresh & Retry
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-title">
          Record Details
          <span style={{ marginLeft: 12, color: 'var(--accent)' }}>locked at v{clientVersion}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
              style={{ minHeight: 200 }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <button type="submit" className="btn btn-primary" disabled={saving || !!conflict}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/records')}>
              Cancel
            </button>
            <span style={{ marginLeft: 'auto' }} className="text-dim mono">
              sending v{clientVersion} → check
            </span>
          </div>
        </form>
      </div>

      {/* Read-only: current server state */}
      {conflict && (
        <div className="card mt-2">
          <div className="card-title" style={{ color: 'var(--warning)' }}>Current Server State (what was saved instead)</div>
          <div style={{ marginBottom: '0.5rem' }}>
            <div className="form-label">Title</div>
            <div style={{ padding: '0.5rem', background: 'var(--bg3)', borderRadius: 4, fontSize: '0.9rem' }}>
              {conflict.currentTitle}
            </div>
          </div>
          <div>
            <div className="form-label">Content</div>
            <div style={{ padding: '0.5rem', background: 'var(--bg3)', borderRadius: 4, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              {conflict.currentContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
