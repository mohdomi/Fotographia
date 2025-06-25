
import React, { useState } from "react";



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FaceMatch from "./pages/FaceMatch";
import Login from "./pages/Login";
import Invite from "./pages/Invite";
import ClientMain from "./pages/ClientMain";

// Demo component to show the invite modal
const InviteDemo = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Invite Modal Demo</h1>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Invite Modal
        </button>
      </div>
      <Invite 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
        <Route path="/face-match" element={<FaceMatch />} />
        <Route path="/invite" element={<InviteDemo />} />
        <Route path="/client" element={<ClientMain />} />
      </Routes>
    </Router>
  );

// import Countdown2 from "./components/CountDown";
// import {BrowserRouter , Routes , Route} from 'react-router-dom';
// import FotografiyaLogin from './pages/Login';

// function App() {
  
//    return( <>   

//     <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<FotografiyaLogin />}/>
//       <Route path="/countodown" element={<Countdown2 />}/>
//     </Routes>
//     </BrowserRouter>

//     </>
}

export default App;
