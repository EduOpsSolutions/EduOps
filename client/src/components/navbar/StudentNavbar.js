import React from 'react';
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-screen flex flex-row justify-between items-center bg-white px-5 py-4 border-b-[5px] border-custom-grey2">
      <Link to='/user' className="font-bold text-2xl">LOGO</Link>
      <div className="flex items-center font-['Barlow_Semi_Condensed'] text-xl">
        <Link to='/user' className="cursor-pointer ms-8 hover:text-gray-500">Home</Link>    
      </div>
    </nav>
  )
}

export default Navbar