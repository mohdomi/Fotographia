import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FaceMatch from "./pages/FaceMatch";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/Route/ProtectedRoute";
import Circular from "./components/Spinner/Circular";
import React, { lazy, Suspense } from 'react';
import AddAccessForm from "./pages/AddAccesForm";
const ClientMain = lazy(() => import('./pages/ClientMain'));
import { useDispatch} from 'react-redux';
import { setUser } from "./store/slice/authSlice";
import { useEffect } from "react";
import FileUpload from "./pages/FileUploadDemo";
function App() {

  const dispatch=useDispatch();
  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) dispatch(setUser(JSON.parse(storedUser)));
}, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
        <Route path="/face-match" element={<FaceMatch />} />
        <Route path="/fac-match" element={<FileUpload />} />

    


        {/* Lazy loaded + protected route */}
        <Route element={<ProtectedRoute />}>
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
  );

}
export default App;