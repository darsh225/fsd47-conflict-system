import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Records from './pages/Records';
import EditRecord from './pages/EditRecord';
import ConflictHistory from './pages/ConflictHistory';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Initializing...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/records" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Initializing...</div>;
  if (user) return <Navigate to="/records" replace />;
  return children;
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    <div className="main-content">{children}</div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/records" element={
            <ProtectedRoute>
              <Layout><Records /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/records/:id/edit" element={
            <ProtectedRoute>
              <Layout><EditRecord /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/conflicts" element={
            <ProtectedRoute adminOnly>
              <Layout><ConflictHistory /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/records" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
