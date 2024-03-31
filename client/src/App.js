import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';

import ForgotPassword from './pages/forgotPassword';
import Login from "./pages/login";
import SignUp from './pages/sign-up';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/sign-up" element={<SignUp/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
