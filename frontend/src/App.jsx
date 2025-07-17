
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

import Login from "./pages/Login";
import ProtectedRoute from "./pages/Route/ProtectedRoute";
import Circular from "./components/Spinner/Circular";
import  { lazy, Suspense } from 'react';
import AddAccessForm from "./pages/AddAccesForm";
const ClientMain = lazy(() => import('./pages/ClientMain'));
import ProtectedForAdmin from "./pages/Route/ProtectedForAdmin";
import { useDispatch} from 'react-redux';
import { setUser } from "./store/slice/authSlice";
import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import FileUpload from "./pages/FileUploadDemo";
function App() {
  const dispatch=useDispatch();
  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) dispatch(setUser(JSON.parse(storedUser)));
}, [dispatch]);

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        
        {/* <Route path="/add-project" element={<AddProject />} /> */}
        
        <Route element={<ProtectedForAdmin />}>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/dashboard/pending" element={<Dashboard />} />
        <Route path="/dashboard/current" element={<Dashboard />} />
        <Route path="/dashboard/completed" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<Circular/>}>
                <Dashboard/>
              </Suspense>
            }
          />
          </Route>
        {/* <Route path="/invite" element={<InviteDemo />} /> */}
        

  
        {/* <Route path="/face-match" element={<FaceMatch />} /> */}
    
        {/* Lazy loaded + protected route */}
        <Route element={<ProtectedRoute />}>
        <Route path="/client" element={<ClientMain />} />
          <Route
            path="/user"
            element={
              <Suspense fallback={<Circular/>}>
                <ClientMain />
              </Suspense>
            }
          />
          <Route path="/access" element={<Suspense fallback={<Circular/>}>
                <AddAccessForm />
              </Suspense>}/>
        </Route>

      </Routes>
    </Router>
         <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // or "light", "dark"
      />
</>
  );

}
export default App;