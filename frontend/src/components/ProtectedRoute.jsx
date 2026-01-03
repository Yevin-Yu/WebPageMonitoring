import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { storage } from '../utils/storage';

export function ProtectedRoute({ children }) {
  if (!storage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


