import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ProjectMonitoring from './components/ProjectMonitoring';
import Login from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/Layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={localStorage.getItem('token') ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<ProjectList />} />
                      <Route path="/monitoring" element={<ProjectMonitoring />} />
                      <Route path="/projects/:projectKey" element={<ProjectDetail />} />
                    </Routes>
                  </ErrorBoundary>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

