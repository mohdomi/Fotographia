import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../../api/axios'; // your axios instance

const ProtectedRoute = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/api/v1/user/me', { withCredentials: true });
        setAuthenticated(true);
      }catch{
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkSession();
  }, []);

  if (!authChecked) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
