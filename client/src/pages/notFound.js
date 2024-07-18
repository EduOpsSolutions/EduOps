import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  const handleClick = () =>{
    navigate('/');
  }
  console.log("appended notfound")
  return (
    <div className='w-full h-full pt-10 transition duration-150'>
      <div className='w-[60%]'>
     <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Not Found!</h1>
<p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Error (404)</p>
<p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">You are trying to access a page that is unavailable!</p>
<button onClick={handleClick} class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-german-red rounded-lg hover:bg-dark-red-2 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
    Go Back
    <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
  </svg>
</button >
</div>
      </div>
  )
}

export default NotFound