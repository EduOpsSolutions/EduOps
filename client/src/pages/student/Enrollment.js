import React, { useState } from 'react'
import { RxCrossCircled, RxCircle, RxCheckCircled, RxCountdownTimer } from "react-icons/rx";

function Enrollment() {

  const [remark_msg, setremark_msg] = useState("This is a test message.");
  const [enrollment_id, setenrollment_id] = useState("E2024082002");
  const [enrollment_status, setenrollment_status] = useState("Pending");
  return (
    <div className='flex flex-col justify-center items-center'>
        <div className='flex flex-col items-center mt-10 w-[80vw] p-5 border border-solid shadow-lg rounded-lg'> {/*This is the main box container*/}
          <div className='w-[90%]'>
            <p className='mt-5 text-start'>Enrollee ID: {enrollment_id}</p>
            <p className='mt-2 text-start text-xl'>Enrollment Status: {enrollment_status}</p>
          </div>
          <div className='flex flex-row mt-10'> {/*This is the container of the indicators*/}
            <div className='flex flex-col justify-center items-center'>
                    <RxCheckCircled size='12rem' color='#86de5d'/> {/*this is for the success indicator */}
                    <p>Enrollment Form</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <RxCheckCircled size='12rem' color='#86de5d'/> {/*this is for the fail indicator */}
                    <p>Form Verification</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <RxCircle  size='12rem' /> {/*this is for the in progress indicator */}
                    <p>Payment</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <RxCountdownTimer size='12rem' /> {/*this is for the in progress indicator */}
                    <p>Payment Verification</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <RxCountdownTimer size='12rem' /> {/*this is for the in progress indicator */}
                    <p>Complete</p>
                </div>
            </div>  
              <div className='w-[70%] p-4 shadow-lg rounded-lg border-solid border-neutral-200 border justify-center items-center mt-20'>
                  <p className='text-center'>Remarks: {remark_msg}</p>
              </div>

              <button 
                class="w-[12rem] mt-10 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                Proceed to Payment
            </button>

            <div className='flex mt-20 w-[90%] justify-start'>
                  <p className='text-start text-xs'>For enrollment concerns please contact: (+63) 97239232223 <br/> Email: info@sprachinstitut-cebu.inc</p>
              </div>

            </div>

    </div>
  )
}

export default Enrollment