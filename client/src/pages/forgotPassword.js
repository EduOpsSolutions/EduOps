import React from 'react';
import bg_image from '../assets/bg_1.png';

function forgotPassword() {
  return (
    <div className="flex bg_1 justify-center items-center h-screen bg-dark-red-5" style={{ backgroundImage: `url(${bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div className='flex flex-col items-center justify-center bg-white-yellow md:h-auto md:min-h-[50vh] min-w-[30%]'> 

          <p className="text-2xl font-bold">Reset Password</p>
      
          <form className="flex flex-col items-center w-5/6 my-2">
            <p className="self-start mt-5">New Password:</p>
            <input type="password" name="password" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/> 
            
            <p className="self-start mt-3">Confirm Password:</p>
            <input type="password" name="conf-password" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/> 
            
            <a href="index.html"><button type="button" className="mt-5 w-32 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150">Confirm</button></a>
          </form>
      </div>
    </div>
  )
}

export default forgotPassword