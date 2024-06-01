import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/StudentNavbar';

function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout