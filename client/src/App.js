import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';

/*Utility Pages*/
import Assets from "./pages/Assets";

/* General Pages */
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';
import SignUp from './pages/public/SignUp';



/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Documents from './pages/student/documents/Documents';
import Enrollment from './pages/student/Enrollment';
import Grades from './pages/student/grades/Grades';
import Home from './pages/student/home/Home';
import StudentSchedule from './pages/student/StudentSchedule';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<Login/>}/>
          <Route path="assets" element={<Assets/>}/>
          <Route path="sign-up" element={<SignUp/>}/>
          <Route path="privacy-policy" element={<PrivacyPolicy/>}/>
          <Route path="terms" element={<Terms/>}/>

          

          {/* Student Page Routes */}
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<Home />} />                            {/* localhost/student */}
            <Route path="grades"  element={<Grades />}/> 
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
