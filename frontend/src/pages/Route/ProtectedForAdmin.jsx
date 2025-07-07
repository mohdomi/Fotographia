import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProtectedForAdmin() {
  const user = useSelector((state) => state.auth.user); // assumed state.auth.user
  const role = user?.role;
  const location = useLocation();
  const navigate = useNavigate();
console.log(location);
  useEffect(() => {
    if (user && role !== "MainAdmin") {
      toast.warning("You are not admin");

      // Go back to previous page or home
      navigate(location.state?.from || '/', { replace: true });
    }
  }, [user, role, location, navigate]);

  // Wait for user to be loaded (optional loading state)
  if (!user) return <h1>Loading...</h1>;

  // Only show admin route if role is MainAdmin
  return role === "MainAdmin" ? <Outlet /> : null;
}

export default ProtectedForAdmin;
