import React from 'react';
import { useLocation } from "react-router-dom";
import Bg_image from '../../assets/images/Bg2.png';
import ThinRedButton from '../../components/buttons/ThinRedButton';

function TeachingLoad() {
    const location = useLocation();
    const status = location.state?.status;
    const showButton = status === 'fromAssessment' ? 1 : 0;

    return(
        <section className='flex justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <div className='h-[calc(100vh-80px)] overflow-hidden box-border flex flex-col py-12 px-20'>
                <div className='h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]'>
                    <div className='flex flex-row gap-7 items-center pb-4 border-b-2 border-black'>
                        <p className='text-xl uppercase grow'>Dolor, Polano I</p>
                    </div>
                    <table className='w-full table-fixed'>
                        <thead>
                            <tr className='border-b-2 border-[#828282]'>
                                <th className='py-3 font-normal'> Course </th>
                                <th className='py-3 font-normal'> Schedules </th>
                                <th className='py-3 font-normal'> Room </th>
                                <th className='py-3 font-normal'> # of Hours </th>
                                <th className='py-3 font-normal'> Students </th>
                                <th className='py-3 font-normal'> </th>
                            </tr>
                        </thead>
                    </table>
                    <div className='grow overflow-y-auto'>
                        {/* Replace code below with backend data */}
                        <table className='w-full table-fixed'>
                            <tbody>
                                <tr  className='border-b-2 border-[#828282]'>
                                    <td className='py-3 text-center'> A1 </td>
                                    <td className='py-3 text-center'>
                                        <p>TTh</p>
                                        <p>6:30AM - 7:30AM</p>
                                    </td>
                                    <td className='py-3 text-center'> Room 01 </td>
                                    <td className='py-3 text-center'> 1 </td>
                                    <td className='py-3 text-center'> 10/15 </td>
                                    <td class="px-6 py-2 text-center">
                                        <ThinRedButton onClick={() => {}}>
                                            <p className="text-xs">View Students</p>
                                        </ThinRedButton>
                                    </td>
                                </tr>
                                <tr  className='border-b-2 border-[#828282]'>
                                    <td className='py-3 text-center'> A1 </td>
                                    <td className='py-3 text-center'>
                                        <p>TTh</p>
                                        <p>9:30AM - 10:30AM</p>
                                    </td>
                                    <td className='py-3 text-center'> VR 02 </td>
                                    <td className='py-3 text-center'> 1 </td>
                                    <td className='py-3 text-center'> 11/15 </td>
                                    <td class="px-6 py-2 text-center">
                                        <ThinRedButton onClick={() => {}}>
                                            <p className="text-xs">View Students</p>
                                        </ThinRedButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TeachingLoad