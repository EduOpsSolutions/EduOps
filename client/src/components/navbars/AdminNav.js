import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/SprachinsLogo.png";

import { NavLink } from "react-router-dom";

function AdminNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <NavLink to="/admin">Enrollment</NavLink>
          {isDropdownOpen && (
            <ul className="absolute bg-white shadow-md rounded-md py-1 mt-1">
              <li>
                <NavLink
                  to="/admin/enrollment/schedule"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Schedule
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/CourseManagement"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Course Management
                </NavLink>
              </li>
            </ul>
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
      <div className="h-[48px] w-[48px] flex justify-center items-center font-bold text-xl border-2 rounded-full cursor-pointer">
        PD
      </div>
    </nav>
  );
}

export default AdminNavbar;
