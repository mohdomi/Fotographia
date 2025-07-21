import { useEffect, useState } from 'react';
import {Outlet } from 'react-router-dom';
import { useLocation,useNavigate } from 'react-router-dom';
const ProtectedRoute = () => {
  const [authenticated, setAuthenticated] = useState(false);
const location = useLocation();
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("user"));
 
  useEffect(() => {
     if (data?.role === "MainAdmin" || data?.user?.role === "AdminUser") {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
         const from = location.state?.from || "/";
      navigate(from, { replace: true });
      }
    }
  , [data,navigate,location]);

  return authenticated? <Outlet/>:null;
  // if (authenticated) return <Navigate to="/" replace={true} />;
  // return <Outlet />;
};

export default ProtectedRoute;
