import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { syncService } from '../services/authService';
import '../styles/Sync.css';

export default function SyncPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [syncHistory, setSyncHistory] = React.useState([]);
  const [selectedSync, setSelectedSync] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [apiUrl, setApiUrl] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    fetchSyncHistory();
  }, []);

  const fetchSyncHistory = async () => {
    setLoading(true);
    try {
      const response = await syncService.getSyncHistory(1, 10);
      if (response.success) {
        setSyncHistory(response.data.syncLogs || []);
      }
    } catch (err) {
      setError('Failed to load sync history');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSync = async () => {
    setSyncLoading(true);
    setError('');
    try {
      const response = await syncService.testSync();
      if (response.success) {
        alert(`✅ Test sync successful!\nSynced: ${response.data.summary.synced}/${response.data.summary.total}`);
        fetchSyncHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Test sync failed');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSync = async () => {
    if (!apiUrl.trim()) {
      setError('Please enter API URL');
      return;
    }

    setSyncLoading(true);
    setError('');
    try {
      const response = await syncService.syncStudents(apiUrl, apiKey || null);
      if (response.success) {
        alert(`✅ Sync completed!\nSynced: ${response.data.summary.synced}/${response.data.summary.total}`);
        setApiUrl('');
        setApiKey('');
        fetchSyncHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncLoading(false);
    }
  };

  const viewSyncDetails = async (syncId) => {
    try {
      const response = await syncService.getSyncDetails(syncId);
      if (response.success) {
        setSelectedSync(response.data);
      }
    } catch (err) {
      setError('Failed to load sync details');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sync-container">
      <nav className="navbar">
        <div className="nav-brand">Data Sync Manager</div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <span className="nav-user">{user?.firstName}</span>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="sync-content">
        <h1>Data Synchronization</h1>

        {error && <div className="error-message">{error}</div>}

        {!selectedSync ? (
          <>
            <div className="sync-form">
              <h2>Sync Students from API</h2>
              
              <div className="form-group">
                <label>API URL *</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-api.com/students"
                />
              </div>

              <div className="form-group">
                <label>API Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key if required"
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleSync}
                  disabled={syncLoading}
                >
                  {syncLoading ? 'Syncing...' : 'Start Sync'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleTestSync}
                  disabled={syncLoading}
                >
                  {syncLoading ? 'Testing...' : 'Test with Mock Data'}
                </button>
              </div>
            </div>

            <div className="sync-history">
              <h2>Sync History</h2>
              {loading ? (
                <p>Loading...</p>
              ) : syncHistory.length === 0 ? (
                <p>No sync history yet</p>
              ) : (
                <div className="history-table">
                  {syncHistory.map((sync) => (
                    <div key={sync._id} className="sync-item">
                      <div className="sync-info">
                        <strong>{sync.syncType}</strong>
                        <span className={`status ${sync.status}`}>{sync.status}</span>
                      </div>
                      <div className="sync-stats">
                        <span>Synced: {sync.summary.synced}/{sync.summary.total}</span>
                        <span>Duplicates: {sync.summary.duplicates}</span>
                        <span>Invalid: {sync.summary.invalid}</span>
                      </div>
                      <button 
                        className="btn btn-small"
                        onClick={() => viewSyncDetails(sync._id)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="sync-details">
            <button className="btn btn-back" onClick={() => setSelectedSync(null)}>
              ← Back to History
            </button>

            <h2>Sync Details</h2>
            <div className="details-card">
              <div className="details-row">
                <strong>Type:</strong> {selectedSync.syncType}
              </div>
              <div className="details-row">
                <strong>Status:</strong> {selectedSync.status}
              </div>
              <div className="details-row">
                <strong>Duration:</strong> {selectedSync.duration}ms
              </div>
              <div className="details-row">
                <strong>Completed:</strong> {new Date(selectedSync.completedAt).toLocaleString()}
              </div>
            </div>

            <div className="summary-box">
              <h3>Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <span className="label">Total</span>
                  <span className="value">{selectedSync.summary.total}</span>
                </div>
                <div className="stat success">
                  <span className="label">Synced</span>
                  <span className="value">{selectedSync.summary.synced}</span>
                </div>
                <div className="stat warning">
                  <span className="label">Duplicates</span>
                  <span className="value">{selectedSync.summary.duplicates}</span>
                </div>
                <div className="stat error">
                  <span className="label">Invalid</span>
                  <span className="value">{selectedSync.summary.invalid}</span>
                </div>
                <div className="stat error">
                  <span className="label">Failed</span>
                  <span className="value">{selectedSync.summary.failed}</span>
                </div>
              </div>
            </div>

            {selectedSync.errors && selectedSync.errors.length > 0 && (
              <div className="errors-box">
                <h3>Errors ({selectedSync.errors.length})</h3>
                <div className="error-list">
                  {selectedSync.errors.map((error, idx) => (
                    <div key={idx} className="error-item">
                      <strong>Record {error.recordIndex || 'N/A'}:</strong> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
