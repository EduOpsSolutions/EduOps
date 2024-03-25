import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Navigate } from 'react-router-dom';

import Login from "./pages/login";
import ForgotPassword from './pages/forgotPassword';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
