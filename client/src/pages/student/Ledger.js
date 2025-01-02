import React from 'react';
import { Link, useLocation } from "react-router-dom";
import ThinRedButton from '../../components/buttons/ThinRedButton';
import BackButton from '../../components/buttons/BackButton';

function Ledger() {
    const location = useLocation();
    const status = location.state?.status;
    const showButton = status === 'fromAssessment' ? 1 : 0;

    return(
        <div className='bg-white-yellow-tone h-[calc(100vh-80px)] overflow-hidden box-border flex flex-col py-12 px-20'>
            <div className='h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]'>
                <div className='flex flex-row gap-7 items-center pb-4 border-b-2 border-dark-red-2'>
                    {showButton === 1 && (
                        <div className='m-6 relative bottom-6 right-6'>
                            <Link to='/student'><BackButton /></Link>
                        </div>
                    )}
                    <p className='text-xl uppercase grow'>Dolor, Polano I</p>
                    <span className='m-0'>
                        <ThinRedButton>Print Ledger</ThinRedButton>
                    </span>
                </div>
                <table className='w-full table-fixed'>
                    <thead>
                        <tr className='border-b-2 border-dark-red-2'>
                            <th className='py-3 font-normal'> Date </th>
                            <th className='py-3 font-normal'> Time </th>
                            <th className='py-3 font-normal'> O.R Number </th>
                            <th className='py-3 font-normal'> Debit Amount </th>
                            <th className='py-3 font-normal'> Credit Amount </th>
                            <th className='py-3 font-normal'> Balance </th>
                            <th className='py-3 font-normal'> Type </th>
                            <th className='py-3 font-normal'> Remarks </th>
                        </tr>
                    </thead>
                </table>
                <div className='grow overflow-y-auto'>
                    <table className='w-full table-fixed'>
                        <tbody>
                            <tr  className='border-b-2 border-[rgb(137,14,7,.49)]'>
                                <td className='py-3 text-center'> 4/3/24 </td>
                                <td className='py-3 text-center'> 6:29:23AM </td>
                                <td className='py-3 text-center'> 1000000058 </td>
                                <td className='py-3 text-center'> 28,650.00 </td>
                                <td className='py-3 text-center'> 0.00 </td>
                                <td className='py-3 text-center'> 28,650.00 </td>
                                <td className='py-3 text-center'> Assessment </td>
                                <td className='py-3 text-center'> Assessment Computation </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Ledger