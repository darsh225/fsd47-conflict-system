import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/records" className="navbar-brand">
        FSD-47 <span>// conflict-resolver</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/records" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Records
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/conflicts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Conflicts
            <span className="nav-badge">!</span>
          </NavLink>
        )}
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'var(--mono)' }}>
          {user?.username} [{user?.role}]
        </span>
        <button className="btn-logout" onClick={handleLogout}>logout</button>
      </div>
    </nav>
  );
}
