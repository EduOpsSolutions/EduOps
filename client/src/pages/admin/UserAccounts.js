import React, { useState } from 'react';
import Bg_image from '../../assets/images/Bg2.png';

<link href="https://cdn.tailwindcss.com" rel="stylesheet"></link>


function UserAccounts() {
    const [isChecked, setIsChecked] = useState(false);


    return (
        <section className="flex flex-col items-start justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply h-full" style={{ backgroundImage: `url(${Bg_image})`}}>
            <div className="flex items-center justify-center mt-4">
                <div className="h-[82vh] w-full mx-4 bg-white-yellow-tone rounded-xl px-4 border-dark-red-2 border-2 flex flex-col items-center">
                    <h1 className="text-3xl font-semibold ml-2 text-center mt-2">User Accounts</h1>
                    
                    <div className="flex flex-col items-center w-3/4 mt-4">
                        <div className="flex flex-row items-center w-full">
                            {/* Switch */}
                            <div className="flex-grow flex justify-center absolute inset-x-0">
                                <label className="relative flex cursor-pointer items-center rounded-full border border-red-800 bg-red-800 p-1 w-40">
                                    <input type="checkbox" className="peer sr-only" checked={isChecked} onChange={() => setIsChecked(!isChecked)}/>
                                    <span className={`absolute left-0 top-0 h-full w-1/2 bg-white rounded-full transform transition-transform duration-300 ${
                                        isChecked ? "translate-x-full" : ""
                                    }`}/>
                                    <span
                                    className={`w-1/2 text-center text-sm font-bold z-10 transition-colors ${
                                        isChecked ? "text-white" : "text-black"
                                    }`}>
                                        Students
                                    </span>
                                    <span
                                    className={`w-1/2 text-center text-sm font-bold z-10 transition-colors ${
                                        isChecked ? "text-black" : "text-white"
                                    }`}>
                                        Teacher
                                    </span>
                                </label>
                            </div>
                            {/* Search field */}
                            {/* Note: Insert backend logic for search filter */}
                            <div className="flex-grow flex justify-end  ">
                                <div className="relative w-64 max-w-xs">
                                    <input type="text" name="search" id="search" className="block py-2.5 w-full pl-4 text-sm text-gray-900 bg-white border border-dark-red-2 focus:outline-none focus:ring-0 focus:border-dark-red peer rounded-3xl" placeholder="Search User"/>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => {}}>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-y-scroll max-h-[60vh] border-2 border-dark-red-2"> 
                            <table className="text-sm text-black w-full table-fixed bg-transparent border-2 border-dark-red-2 border-x-0 border-y-0 text-center bg-white">
                            <thead className="sticky top-0 bg-white z-10">
                                    <tr className="divide-x divide-dark-red-2 border-b-2 border-dark-red-2 z-20">
                                        <th scope="col" className="px-2 py-2 w-14">ID</th>
                                        <th scope="col" className="px-2 py-2 w-24">Student ID</th>
                                        <th scope="col" className="px-2 py-2 w-36">Name</th>
                                        <th scope="col" className="px-2 py-2 w-20">Course</th>
                                        <th scope="col" className="px-2 py-2 w-48">Email</th>
                                        <th scope="col" className="px-2 py-2 w-32">Phone Number</th>
                                        <th scope="col" className="px-2 py-2 w-20">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="overflow-y-auto max-h-48">
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                                    <tr className="divide-x divide-dark-red-2 border-t-2 border-t-dark-red-2">
                                        <td className="px-2 py-2">1</td>
                                        <td className="px-2 py-2">3213562</td>
                                        <td className="px-2 py-2">Polano Dolor</td>
                                        <td className="px-2 py-2">A1</td>
                                        <td className="px-2 py-2">polanodolor@gmail.com</td>
                                        <td className="px-2 py-2">09123456789</td>
                                        <td className="px-2 py-2">Status</td>
                                    </tr>
                            
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default UserAccounts