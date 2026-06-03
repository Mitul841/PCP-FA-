import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { authService } from '../services/authService';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isOfficer } = useAuthStore();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setCurrentUser(response.data);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSyncRedirect = () => {
    if (isAdmin() || isOfficer()) {
      navigate('/sync');
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">PCP Recruitment System</div>
        <div className="nav-links">
          <span className="nav-user">Welcome, {user?.firstName} ({user?.role})</span>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="user-card">
          <h2>Your Profile</h2>
          {currentUser && (
            <div className="profile-details">
              <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>Member Since:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {(isAdmin() || isOfficer()) && (
          <div className="admin-section">
            <h2>Admin Controls</h2>
            <div className="admin-actions">
              <button className="action-btn" onClick={handleSyncRedirect}>
                📊 Manage Data Sync
              </button>
              <button className="action-btn" onClick={() => navigate('/users')}>
                👥 Manage Users
              </button>
            </div>
          </div>
        )}

        <div className="info-card">
          <h3>Quick Info</h3>
          <ul>
            <li>✅ Authentication with JWT tokens</li>
            <li>✅ Role-based access control</li>
            <li>✅ Secure API communication</li>
            {(isAdmin() || isOfficer()) && <li>✅ Data synchronization capabilities</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
