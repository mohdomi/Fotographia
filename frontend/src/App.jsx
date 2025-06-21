
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FaceMatch from "./pages/FaceMatch";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
        <Route path="/face-match" element={<FaceMatch />} />
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
