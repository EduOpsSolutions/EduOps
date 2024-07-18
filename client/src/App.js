import './App.css';
import React from 'react';
import { Navigate, Routes, Route, BrowserRouter as Router } from "react-router-dom";

/*Utility Pages*/
import Assets from "./pages/Assets";

/* General Pages */
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import NotFound from './pages/notFound';
import SignUp from './pages/signUp';



/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Enrollment from './pages/student/Enrollment';
import Home from './pages/student/home/Home';
import Documents from './pages/student/documents/Documents';
import StudentSchedule from './pages/student/StudentSchedule';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<Login/>}/>
          <Route path="forgot-password" element={<ForgotPassword/>}/>
          <Route path="assets" element={<Assets/>}/>
          

          {/* Student Page Routes */}
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<Home />} />                            {/* localhost/student */}
            <Route path="documents"  element={<Documents />}/> 
            <Route path="enrollment" element={<Enrollment/>}/>
            <Route path="schedule" element={<StudentSchedule/>}/>
          </Route>


          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
