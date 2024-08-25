import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from '../navbars/StudentNav';

function StudentLayout() {
  return (
    <div className="h-screen flex flex-col">
      <StudentNavbar />
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  )
}

export default StudentLayout