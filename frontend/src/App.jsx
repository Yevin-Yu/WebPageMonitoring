import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import Login from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/Layout/AdminLayout';
import { useAuth } from './hooks/useAuth';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
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
                <Routes>
                  <Route path="/" element={<ProjectList />} />
                  <Route path="/projects/:projectKey" element={<ProjectDetail />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

