import React from 'react';
import bg_image from '../assets/bg_1.png';

function signUp() {
  return (
    <div className="flex bg_1 justify-center items-center h-screen bg-dark-red-5" style={{ backgroundImage: `url(${bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div class="flex flex-col items-center justify-center bg-white-yellow h-auto min-h-[50vh] min-w-[350px] max-w-[33.3333%] py-5">
        <p class="text-3xl font-bold">Register</p>
        <form class="flex flex-col items-center w-5/6 my-2">
            <div class="w-full flex flex-col md:flex-row md:space-x-4">
                <div class="w-full md:w-1/2">
                    <label class="self-start" for="fname">First Name:</label>
                    <input type="text" id="fname" name="fname" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                </div>
                <div class="w-full md:w-1/2 md:mt-0">
                    <label class="self-start" for="mname">Middle Name:</label>
                    <input type="text" id="mname" name="mname" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                </div>
            </div>
            
            <div class="w-full flex flex-col md:flex-row md:space-x-4 mt-2">
                <div class="w-full md:w-1/2">
                    <label class="self-start mt-2" for="lname">Last Name:</label>
                    <input type="text" id="lname" name="lname" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                </div>
                <div class="w-full md:w-1/2">
                    <label class="self-start mt-2" for="birthday">Birthdate:</label>
                    <input type="date" id="birthday" name="birthday" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                </div>
            </div>
            <div class="w-full mt-2">
                <label class="self-start mt-2" for="email">Email:</label>
                <input type="email" id="email" name="email" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
            </div>
            <div class="w-full mt-2">
                <label class="self-start mt-2" for="phone-num">Phone Number:</label>
                <input type="tel" id="phone-num" name="phone-num" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
            </div>

            <div class="w-full mt-2">
                <label class="self-start mt-2" for="password">Password:</label>
                <input type="password" id="password" name="password" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
            </div>
            
            <div class="w-full mt-2">
                <label class="self-start mt-2" for="conf-password">Confirm Password:</label>
                <input type="password" id="conf-password" name="conf-password" class="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
            </div>
            
            <button type="button" class="mt-5 w-32 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150" onclick="openModal('otp-modal', 'overlay-1')">Register</button>
        </form>

        <div>
            <p class="text-sm">Already have an account? <span class="cursor-pointer text-german-red hover:text-dark-red-2"> <a href="index.html">Sign in</a></span> </p>
        </div>
    </div>
    </div>
  )
}

export default signUp