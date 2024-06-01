import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Navigate } from 'react-router-dom';

/* General Pages */
import Login from "./pages/login";
import ForgotPassword from './pages/forgotPassword';

/* Student Pages */
import Layout from './components/layout/StudentLayout';
import Home from './pages/student/home/Home';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>

          {/* Student Page Routes */}
          <Route path="student" element={<Layout />}>
            <Route index element={<Home />} />                            {/* localhost/student */}
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
