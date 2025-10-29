import React from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin', 'superadmin'] }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verify token and check role
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      const userRole = response.data.user.role;
      return allowedRoles.includes(userRole);
    } catch (error) {
      localStorage.removeItem('token');
      return false;
    }
  };

  // Check role synchronously (simplified version)
  const hasValidRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Simple role check from localStorage or sessionStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return allowedRoles.includes(user.role);
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  if (!hasValidRole()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;