import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/SprachinsLogo.png";

import { NavLink } from "react-router-dom";

function AdminNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseOver = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseOut = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-8 py-2 border-b-[5px] border-dark-red-2 z-10">
      <Link to="/admin" className="">
        <img src={logo} alt="" className="h-16 w-auto" />
      </Link>
      <div className="flex w-full justify-center items-center font-bold text-lg">
        <Link to="/admin" className="me-6 hover:text-gray-500">
          Home
        </Link>
        <div
          className="relative me-6 hover:text-gray-500"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <NavLink to="/admin">Enrollment</NavLink>
          {isDropdownOpen && (
            <>
              <div className="absolute h-2 w-full top-full" />
              <ul className="absolute left-1/2 transform -translate-x-1/2 top-[calc(100%+2px)] bg-german-red shadow-md rounded-md py-1 w-40 text-sm">
                <li>
                  <NavLink
                    to="/admin/schedule"
                    className="block px-3 py-1 hover:bg-dark-red-2 text-white"
                  >
                    Schedule
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/CourseManagement"
                    className="block px-3 py-1 hover:bg-dark-red-2 text-white"
                  >
                    Course Assignment
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/EnrollmentPeriod"
                    className="block px-3 py-1 hover:bg-dark-red-2 text-white"
                  >
                    Enrollment Period
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/EnrollmentRequests"
                    className="block px-3 py-1 hover:bg-dark-red-2 text-white"
                  >
                    Enrollment Request
                  </NavLink>
                </li>
              </ul>
            </>
          )}
        </div>
        <Link to="/admin/grades" className="me-6 hover:text-gray-500">
          Grades
        </Link>
        <Link to="/admin/payment" className="me-6 hover:text-gray-500">
          Payment
        </Link>
        <Link to="/admin/documents" className="me-6 hover:text-gray-500">
          Documents
        </Link>
        <Link to="/admin/accounts" className="hover:text-gray-500">
          Accounts
        </Link>
      </div>
      <Link to='/admin/profile'  className="h-[48px] w-[48px] flex justify-center items-center font-bold text-xl border-2 rounded-full cursor-pointer">
        PD
      </Link>
    </nav>
  );
}

export default AdminNavbar;
