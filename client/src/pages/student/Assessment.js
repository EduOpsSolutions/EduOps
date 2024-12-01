import React, { useState } from 'react';
import { Link } from "react-router-dom";
import ThinRedButton from '../../components/buttons/ThinRedButton';
import TransactionHistoryModal from '../../components/modals/common/TransactionHistoryModal';

function Assessment() {
    const [transaction_history_modal, setTransactionHistoryModal] = useState(false);

    return(
        <div className='bg-white-yellow-tone h-full flex flex-col py-16 px-20'>
            <div className='flex flex-row gap-16'>
                <div className='h-fit grow-0 basis-3/12 bg-white border-dark-red-2 border-2 rounded-lg p-7'>
                    <form className='flex flex-col gap-7'>
                        <div className='flex flex-row gap-2 items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className='size-6'>
                                <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                            </svg>
                            <p className='font-semibold'>SEARCH TUITION FEE ASSESSMENT</p>
                        </div>
                        <div>
                            <p className='mb-1'>Course</p>
                            <select name="course" id="course" className='w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black'>
                                <option value="A1">A1 German Basic Course</option>
                                <option value="A2">A2 German Basic Course</option>
                                <option value="A3">A3 German Basic Course</option>
                            </select>
                        </div>
                        <div>
                            <p className='mb-1'>Batch</p>
                            <select name="course" id="course" className='w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black'>
                                <option value="B1">Batch 1</option>
                                <option value="B1">Batch 2</option>
                                <option value="B1">Batch 3</option>
                            </select>
                        </div>
                        <div>
                            <p className='mb-1'>Year</p>
                            <select name="course" id="course" className='w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black'>
                                <option value="Y1">2024</option>
                                <option value="Y2">2023</option>
                                <option value="Y3">2022</option>
                            </select>
                        </div>
                        <div className='flex justify-end'>
                            <button type="submit" className='bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-1.5 text-center shadow-sm shadow-black ease-in duration-150'>
                                Search
                            </button>
                        </div>
                    </form>
                </div>
                <div className='basis-9/12 bg-white border-dark-red-2 border-2 rounded-lg p-10'>
                    <p className='font-bold text-lg text-center mb-5'>A1: Batch 1 | 2024</p>
                    <div className='flex flex-row items-end pb-3 border-b-2 border-dark-red-2'>
                        <p className='uppercase grow'>Dolor, Polano I</p>
                        <div className='m-0'>
                            <ThinRedButton onClick={() => {setTransactionHistoryModal(true)}}>Transaction History</ThinRedButton>
                            <span className='mx-2'></span>
                            <Link to='/student/ledger'><ThinRedButton>Ledger</ThinRedButton></Link>
                        </div>
                    </div>
                    <p className='font-bold text-lg text-center mt-9 mb-1'>FEES</p>
                    <table className='w-full mb-16'>
                        <thead>
                            <tr className='border-b-2 border-dark-red-2'>
                                <th className='py-2 font-bold w-[70%] text-start'>Description</th>
                                <th className='py-2 font-bold w-[15%]'>Amount</th>
                                <th className='py-2 font-bold w-[15%]'>Due date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='border-b-2 border-[rgb(137,14,7,.49)]'>
                                <td className='uppercase py-2'>Course Fee</td>
                                <td className='py-2 text-center'>30,000.00</td>
                                <td className='py-2 text-center'>May 30, 2024</td>
                            </tr>
                            <tr  className='border-b-2 border-[rgb(137,14,7,.49)]'>
                                <td className='uppercase py-2'>Book Fee</td>
                                <td className='py-2 text-center'>2,800.00</td>
                                <td className='py-2 text-center'>May 30, 2024</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='w-full pt-3 border-t-2 border-dark-red-2 grid grid-rows-4 grid-flow-col gap-3'>
                        <div className='grid grid-rows-subgrid row-span-2'>
                            <p className='row-start-2 font-bold'>Net Assessment</p>
                        </div>
                        <p className='font-bold'>Total Payments</p>
                        <p className='font-bold'>Remaining Balance</p>
                        <p className='font-bold text-center'>Amount</p>
                        <p className='text-center'>28,650.00</p>
                        <p className='text-center'>0.00</p>
                        <p className='text-center'>28,650.00</p>
                    </div>
                </div>
            </div>

            <TransactionHistoryModal
                transaction_history_modal={transaction_history_modal}
                setTransactionHistoryModal={setTransactionHistoryModal}
            />
        </div>
    )
}

export default Assessment