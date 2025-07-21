import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';
function ProtectedForAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated,setAuthenticated] =useState(true);
  const data = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    if ( data?.role !== "MainAdmin") {
      toast.warning("You are not admin");
      setAuthenticated(false);
      // Go back to previous page or home

      const from = location.state?.from || "/";
      navigate(from, { replace: true });
      
    }
  }, [navigate,data,location]);

 return authenticated ? <Outlet/> : null;

  
}

export default ProtectedForAdmin;
