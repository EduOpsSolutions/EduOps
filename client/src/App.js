import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';

/* General Pages */
import ForgotPassword from './pages/forgotPassword';
import Login from './pages/login';
import NotFound from './pages/notFound';
import SignUp from './pages/signUp';



/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Documents from './pages/student/documents/Documents';
import Home from './pages/student/home/Home';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />}/>
          

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
