import React from 'react';
import { Link } from "react-router-dom";
import logo from '../../assets/images/SprachinsLogo.png';

function StudentNavbar() {
  return (
    <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-8 py-2 border-b-[5px] border-dark-red-2 z-10">
      <Link to='/student' className="">
        <img src={logo} alt="" className="h-16 w-auto" />
      </Link>
      <div className="flex w-full justify-center items-center font-bold text-lg">
        <Link to='/student' className="me-6 hover:text-gray-500">Home</Link>
        <Link to='/student/enrollment' className="me-6 hover:text-gray-500">Enrollment</Link> 
        <Link to='/student/grades' className="me-6 hover:text-gray-500">Grades</Link> 
        <Link to='/student/assessment' className="me-6 hover:text-gray-500">Payment</Link> 
        <Link to='/student/documents' className="hover:text-gray-500">Documents</Link> 
      </div>
      <div className="h-full flex items-center">
        <div className="cursor-pointer me-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="25" height="25">
            <path fill="white" d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/>
          </svg>
        </div>
        <div className="h-[48px] w-[48px] flex justify-center items-center font-bold text-xl border-2 rounded-full cursor-pointer">
          <Link to='/student/profile' className="hover:text-gray-500">PD</Link>
        </div>
      </div>
    </nav>
  )
}

export default StudentNavbar