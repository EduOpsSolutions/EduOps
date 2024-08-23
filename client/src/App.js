import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';

/*Utility Pages*/
import Assets from "./pages/Assets";

/* General Pages */
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';
import SignUp from './pages/public/SignUp';
import PaymentForm from './pages/public/PaymentForm';
import RedirectPage from './pages/public/RedirectPage';

/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Documents from './pages/student/documents/Documents';
import Enrollment from './pages/student/Enrollment';
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
          <Route path="signUp" element={<SignUp/>}/>
          <Route path="paymentForm" element={<PaymentForm/>}/>
          <Route path="redirectPage" element={<RedirectPage/>}/>

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
