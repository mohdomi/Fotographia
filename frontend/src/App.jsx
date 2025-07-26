
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/Route/ProtectedRoute";
import Circular from "./components/Spinner/Circular";
import  { lazy, Suspense } from 'react';
import AddAccessForm from "./pages/AddAccesForm";
const ClientMain = lazy(() => import('./pages/ClientMain'));
import ProtectedForAdmin from "./pages/Route/ProtectedForAdmin";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewProject from "./pages/NewProject";
//import FileUpload from "./pages/FileUploadDemo";
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
           
        <Route element={<ProtectedForAdmin />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<Circular/>}>
                <Dashboard/>
              </Suspense>
            }
/>
        <Route path="/new-project" element={<NewProject/>}/> 
        <Route path="/dashboard/pending" element={<Dashboard />} />
        <Route path="/dashboard/current" element={<Dashboard />} />
        <Route path="/dashboard/completed" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
   </Route>
        {/* <Route path="/invite" element={<InviteDemo />} /> */}
        

        {/* Lazy loaded + protected route */}
        <Route element={ <Suspense fallback={<Circular/>}>
                <ProtectedRoute/>
              </Suspense>}>
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