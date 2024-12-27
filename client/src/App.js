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
import PaymentForm from './pages/public/PaymentForm';
import RedirectPage from './pages/public/RedirectPage';
import SignUp from './pages/public/SignUp';

/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Documents from './pages/student/Documents';
import Enrollment from './pages/student/Enrollment';
import Grades from './pages/student/Grades';
import Home from './pages/student/Home';
import Profile from './pages/student/Profile';
import StudentSchedule from './pages/student/StudentSchedule';
import StudyLoad from './pages/student/StudyLoad';

/* Teacher Pages */
import TeacherLayout from './components/layout/TeacherLayout';
import TeacherGrades from './pages/teacher/Grades';
import TeacherHome from './pages/teacher/Home';

/* Admin Pages */
import AdminLayout from './components/layout/AdminLayout';
import CourseManagement from './pages/admin/CourseManagement';
import AdminHome from './pages/admin/Home';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<Login/>}/>
          <Route path="assets" element={<Assets/>}/>
          <Route path="signUp" element={<SignUp/>}/>
          <Route path="paymentForm" element={<PaymentForm/>}/>
          <Route path="redirectPage" element={<RedirectPage/>}/>
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
            <Route path="studyLoad" element={<StudyLoad/>}/>
            <Route path="profile" element={<Profile/>}/>
          </Route>

          {/* Teacher Page Routes */}
          <Route path="teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherHome />} />   
            <Route path="grades"  element={<TeacherGrades />}/>          
          </Route>

          {/* Admin Page Routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />  
            <Route path="coursemanagement"  element={<CourseManagement />}/>           
          </Route>



          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
