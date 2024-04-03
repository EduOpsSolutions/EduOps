import React, { useState } from 'react'
import {Link, useNavigate  } from 'react-router-dom';
import logo from '../assets/sprachins_logo.png'
import { VscEyeClosed, VscEye } from "react-icons/vsc";


function Login() {
  const navigate = useNavigate();

  //hyperlink to another page
  const navigateToForgotPassword = (/*these are for parameters*/) => {
    navigate("/forgot-password");
  };

  const navigateToSignUp = () => {
    navigate("/sign-up");
  }

  const submitForm = () =>{
    
  }

  const handlePasswordChange = (e) =>{
    setPassword(e.target.value);
  }

  const handleEmailChange = (e) =>{
    setEmail(e.target.value);
  }


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);


  

  
  return (
    <div className='w-[100vw] h-[100vh] flex justify-center items-center'>
    {/* Login Form */ }
    <div className={` w-[30vw] h-[70vh] bg-whiteYellowTone shadow-lg`}>
      <div className='flex flex-col items-center'>
      <p className=' mt-28 text-lg'> WELCOME TO</p>
      <img className='w-[50%] h-auto' src={logo}/>
      <div>
      </div>
      <div className='mt-12 w-[60%]' >
      <label for="email-address-icon" className="block mb-2 text-sm font-medium self-start text-germanBlack dark:text-white">Email Address</label>
  <div className="relative">
    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
      <svg className="w-4 h-4 text-germanBlack dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
        <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
        <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
      </svg>
    </div>
    <input 
        value={email} 
        onChange={handleEmailChange}
        type="text" 
        id="email-address-icon" 
        className="bg-gray-50 border border-gray-300 text-gray-900 text-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="your-email@gmail.com"/>

    
  </div>
  <div className="mt-5 mb-5">
    <label for="password" className="block mb-2 text-sm font-medium text-germanBlack dark:text-white">Password</label>
    <div className='flex flex-row items-center'>
    <input value={password} onChange={handlePasswordChange} placeholder='********' type="password" id="password" className="h-[5vh] w-[80%] shadow-sm bg-gray-50 border border-gray-300 text-germanBlack text-sm focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required></input>

    <button 
    onClick={()=>{setShowPassword(!showPassword)}}
    className='ml-1 w-[20%] h-[5vh] shadow-sm bg-gray-50 border border-gray-300 text-germanBlack focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light'>
      { showPassword? <VscEye className='w-[100%]'/>:
        <VscEyeClosed className='w-[100%]'/>}
      
      </button>
    </div>
  </div>

<div className='flex justify-end'>
  <button className='text-xs mt-[-1rem] text-germanRed ' onClick={
    navigateToForgotPassword
  }>Forgot Your Password? 
  </button>
  
  </div>
  <button 
      onClick={submitForm}
      onChange={handlePasswordChange}
      type={showPassword ? 'text' : 'password'}
      class=" mt-10 w-[45%] focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
    Login
    </button>

    <div className=''>
  <button className='text-xs mt-[-1rem] text-germanBlack ' onClick={
    navigateToSignUp
  }>Don't have an account? <span className='text-germanRed underline'>Sign Up</span>
  </button>
  
  </div>
  </div>
      </div>

    </div>
    </div>
  )
}

export default Login