import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Navigate } from 'react-router-dom';

/*Utility Pages*/
import Assets from "./pages/Assets";

/* General Pages */
import Login from "./pages/login";
import ForgotPassword from './pages/forgotPassword';
import NotFound from './pages/notFound';

/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Home from './pages/student/home/Home';
import Documents from './pages/student/documents/Documents';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="assets" element={<Assets/>}/>
          {/* Student Page Routes */}
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<Home />} />                            {/* localhost/student */}
            <Route path="documents"  element={<Documents />}/> 
          </Route>


          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
