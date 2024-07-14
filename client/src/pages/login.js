import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg_image from '../assets/login_bg.png';
import left_section_image from '../assets/php_german_flag.jpg';
import logo from '../assets/sprachins_logo.png';
import RedButton from '../components/redButton';


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
    // Backgroung image and overlay
    <div className='flex justify-center items-center bg-white-yellow' style={{ backgroundImage: `url(${bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
    <div className='absolute inset-0 bg-white-yellow opacity-75'></div>
    
    {/* Login Form */ }
    {/* Login Form */}
    {/* Login Form */}
    <div className="relative flex items-center justify-center bg-dark-red-3 w-[1200px] h-[630px] z-10 overflow-hidden">
    <div className="flex w-full h-full relative">
    
    <div className="flex-[1.3] flex items-center justify-center relative">
    {/* Left Section */}
    <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${left_section_image})`, backgroundSize: '115%', backgroundPosition: '100% 40%', clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)'}}></div>

    {/* Slanted Divider */}
    <div className="absolute inset-y-0 right-[4.1rem] w-0.5 bg-german-yellow transform -skew-x-12"></div>
</div>

    {/* Right Section */}
    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
      <p className="font-normal text-2xl text-white">WELCOME TO</p>
      <img className='w-[50%] h-auto' src={logo} />
      <form className="flex flex-col items-center w-2/3">
        {/* Email text field */}
        <div className="relative mb-3 mt-3 w-full">  
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="absolute top-1/2 left-3 transform -translate-y-1/2 w-6 h-6 text-black">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
          </svg>
          <input type="text" id="email" name="email" className="border border-black pl-10 pr-4 py-1 h-10 focus:outline-none bg-white-yellow w-full" placeholder="User ID or Email" onChange={handleEmailChange} />
        </div>

        {/* Password text field */}
        <div className="relative w-full bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className= "absolute top-1/2 left-3 transform -translate-y-1/2 w-6 h-6 text-black">
            <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd" />
          </svg>
          <input type="password" id="password" name="password" className="border border-black pl-10 pr-4 py-1 h-10 focus:outline-none bg-white-yellow w-full" placeholder="Password" />
        </div>

        <div className="self-end">
          <p className="mt-2 text-sm text-german-yellow hover:text-dark-red-2 cursor-pointer" onClick={navigateToForgotPassword}>Forgot password?</p>
        </div>
        {/* Need to edit on hover color */}
        <RedButton>
          Login
        </RedButton>
        {/* <button type="button" className="mt-5 w-5/12 h-10 self-center size-8 font-bold bg-german-red text-white-yellow hover:bg-dark-red-2 ease-in duration-150">Login</button> */}
      </form>

      <div>
        <p className="text-sm mt-5">Don't have an account? <span className="cursor-pointer text-german-red hover:text-dark-red-2"> <a onClick={navigateToSignUp}>Sign up</a></span> </p>
      </div>

      <div className='w-80'>
        <p className="text-sm mt-5 text-white">By using this service, you understood and agree to our 
          <span className="cursor-pointer text-german-yellow hover:text-dark-red-2"> 
            <a onClick={navigateToSignUp}> Terms</a>
          </span>
          {' and '}
          <span className="cursor-pointer text-german-yellow hover:text-dark-red-2"> 
            <a onClick={navigateToSignUp}>Privacy Policy</a>
          </span> 
        </p>
      </div>
    </div>
  </div>
</div>




    </div>

  )
}

export default Login