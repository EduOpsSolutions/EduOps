import React from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import './App.css';

/*Utility Pages*/
import Assets from './pages/Assets';

/* General Pages */
import PublicLayout from './components/layout/PublicLayout';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';
import PaymentForm from './pages/public/PaymentForm';
import Profile from './pages/public/Profile';
import RedirectPage from './pages/public/RedirectPage';
import SignUp from './pages/public/SignUp';

/* Student Pages */
import StudentLayout from './components/layout/StudentLayout';
import Documents from './pages/student/Documents';
import Enrollment from './pages/student/Enrollment';
import Grades from './pages/student/Grades';
import Home from './pages/student/Home';
import StudentSchedule from './pages/student/StudentSchedule';
import StudyLoad from './pages/student/StudyLoad';
import Ledger from './pages/student/Ledger';
import Assessment from './pages/student/Assessment';

/* Teacher Pages */
import TeacherLayout from './components/layout/TeacherLayout';
import TeacherHome from './pages/teacher/Home';
import TeachingLoad from './pages/teacher/TeachingLoad';

/* Admin Pages */
import AdminLayout from './components/layout/AdminLayout';
import CourseManagement from './pages/admin/CourseManagement';
import AdminHome from './pages/admin/Home';
import EnrollmentRequests from './pages/admin/EnrollmentRequests';
import EnrollmentPeriod from './pages/admin/EnrollmentPeriod';
import Transaction from './pages/admin/Transaction';
import AccountManagement from './pages/admin/AccountManagement';
import useAuthStore from './stores/authStore';
import AdminLedger from './pages/admin/Ledger';
import AdminAssessment from './pages/admin/Assessment';
import ManageFees from './pages/admin/ManageFees';

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="assets" element={<Assets />} />
          <Route path="signUp" element={<SignUp />} />
          <Route path="paymentForm" element={<PaymentForm />} />
          <Route path="redirectPage" element={<RedirectPage />} />
          <Route path="sign-up" element={<SignUp />} />

          {/* Public legal Routes */}
          <Route path="legal" element={<PublicLayout />}>
            <Route index element={<Login />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          {isAuthenticated ? (
            <>
              {/* Student Page Routes */}
              <Route path="student" element={<StudentLayout />}>
                <Route index element={<Home />} /> {/* localhost/student */}
                <Route path="enrollment" element={<Enrollment />} />
                <Route path="schedule" element={<StudentSchedule />} />
                <Route path="studyLoad" element={<StudyLoad />} />
                <Route path="grades" element={<Grades />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="ledger" element={<Ledger />} />
                <Route path="documents" element={<Documents />} />
                <Route path="profile" element={<Profile />} />
                <Route path="legal">
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                </Route>
              </Route>

              {/* Teacher Page Routes */}
              <Route path="teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherHome />} />
                <Route path="profile" element={<Profile role="teacher" />} />
                <Route path="teachingLoad" element={<TeachingLoad />} />
                <Route path="documents" element={<Documents />} />
                <Route path="legal">
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                </Route>
              </Route>

              {/* Admin Page Routes */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="coursemanagement" element={<CourseManagement />} />
                <Route path="profile" element={<Profile role="admin" />} />
                <Route
                  path="enrollmentrequests"
                  element={<EnrollmentRequests />}
                />
                <Route path="enrollmentperiod" element={<EnrollmentPeriod />} />
                <Route path="legal">
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                </Route>
                <Route path="transaction" element={<Transaction />} />
                <Route
                  path="account-management"
                  element={<AccountManagement />}
                />
                <Route path="ledger" element={<AdminLedger />} />
                <Route path="assessment" element={<AdminAssessment />} />
                <Route path="managefees" element={<ManageFees />} />
              </Route>
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}

          {/* Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
