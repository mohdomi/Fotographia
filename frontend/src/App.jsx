
import React, { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

import Login from "./pages/Login";

import Invite from "./pages/Invite";
import ClientMain from "./pages/ClientMain";
import AddProject from "./pages/AddProject";
\


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
oves-branch
        <Route path="/dashboard/pending" element={<Dashboard />} />
        <Route path="/dashboard/current" element={<Dashboard />} />
        <Route path="/dashboard/completed" element={<Dashboard />} />
        <Route path="/add-project" element={<AddProject />} />
        
        <Route path="/invite" element={<InviteDemo />} />
        <Route path="/client" element={<ClientMain />} />

        <Route path="/dashboard/:section" element={<Dashboard />} />
        <Route path="/face-match" element={<FaceMatch />} />

      </Routes>
    </Router>
  );
}

export default App;
