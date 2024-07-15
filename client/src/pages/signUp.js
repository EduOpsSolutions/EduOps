import React from 'react';
import { useNavigate } from 'react-router-dom';
import bg_image from '../assets/germany_bg.png';
import openModal from '../utils/modal';

function SignUp() {
    const navigate = useNavigate();

    // Function to navigate to login page
    const navigateToLogin = () => {
        navigate("/login");
    };

    return (
        <div className='flex justify-center items-center bg-white-yellow-tone' style={{ backgroundImage: `url(${bg_image})`, backgroundSize: '135%', backgroundPosition: '20% 70%', minHeight: '100vh' }}>
        <div className='absolute inset-0 bg-white-yellow-tone opacity-75'></div>
            <div className="flex flex-col items-center justify-center bg-white-yellow h-auto min-h-[50vh] min-w-[350px] max-w-[33.3333%] py-5 z-10 bg-dark-red-2">
                <p className="text-3xl font-bold">Register</p>
                <form className="flex flex-col items-center w-5/6 my-2">
                    <div className="w-full flex flex-col md:flex-row md:space-x-4">
                        <div className="w-full md:w-1/2">
                            <label className="self-start" htmlFor="fname">First Name:</label>
                            <input type="text" id="fname" name="fname" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                        </div>
                        <div className="w-full md:w-1/2 md:mt-0">
                            <label className="self-start" htmlFor="mname">Middle Name:</label>
                            <input type="text" id="mname" name="mname" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                        </div>
                    </div>

                    <div className="w-full flex flex-col md:flex-row md:space-x-4 mt-2">
                        <div className="w-full md:w-1/2">
                            <label className="self-start mt-2" htmlFor="lname">Last Name:</label>
                            <input type="text" id="lname" name="lname" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                        </div>
                        <div className="w-full md:w-1/2">
                            <label className="self-start mt-2" htmlFor="birthday">Birthdate:</label>
                            <input type="date" id="birthday" name="birthday" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                        </div>
                    </div>
                    <div className="w-full mt-2">
                        <label className="self-start mt-2" htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                    </div>
                    <div className="w-full mt-2">
                        <label className="self-start mt-2" htmlFor="phone-num">Phone Number:</label>
                        <input type="tel" id="phone-num" name="phone-num" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                    </div>

                    <div className="w-full mt-2">
                        <label className="self-start mt-2" htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                    </div>

                    <div className="w-full mt-2">
                        <label className="self-start mt-2" htmlFor="conf-password">Confirm Password:</label>
                        <input type="password" id="conf-password" name="conf-password" className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"/>
                    </div>

                    <button type="button" className="mt-5 w-32 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150" onClick={() => openModal('otp-modal', 'overlay-1')}>Register</button>
                </form>

                <div>
                    <p className="text-sm">Already have an account? <span className="cursor-pointer text-german-red hover:text-dark-red-2"> <a onClick={navigateToLogin}>Sign in</a></span> </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
