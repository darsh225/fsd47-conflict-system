import React, { useState, useEffect } from 'react';
import { getConflicts } from '../api';

export default function ConflictHistory() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getConflicts();
        setConflicts(res.data.conflicts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load conflict history.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Conflict History</h1>
        <p className="page-subtitle">// admin view — all rejected update attempts</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading conflicts...</div>
      ) : conflicts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-text">No conflicts recorded yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Attempted By</th>
                <th>Client v</th>
                <th>Server v</th>
                <th>Conflicted With</th>
                <th>Status</th>
                <th>Attempted Data</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.recordTitle || c.recordId?.title || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                      {typeof c.recordId === 'object' ? c.recordId?._id?.slice(-8) : String(c.recordId).slice(-8)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {c.attemptedByUsername || c.attemptedBy?.username || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--warning)' }}>v{c.clientVersion}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>v{c.serverVersion}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{c.conflictedWithUsername || '—'}</td>
                  <td>
                    <span className="badge badge-rejected">{c.status}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', maxWidth: 200 }}>
                      <div><strong>{c.attemptedData?.title}</strong></div>
                      <div style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.attemptedData?.content}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.78rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
