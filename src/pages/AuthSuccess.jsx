import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Redirect to appropriate page based on user role
      // We'll fetch user info to determine role
      const fetchUser = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData.user));
            
            if (userData.user.role === 'admin' || userData.user.role === 'superadmin') {
              navigate('/admin');
            } else {
              navigate('/user');
            }
          } else {
            localStorage.removeItem('token');
            navigate('/login');
          }
        } catch (error) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;