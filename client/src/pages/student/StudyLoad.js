import React from 'react';
import ThinRedButton from "../../components/buttons/ThinRedButton";
import SearchField from "../../components/textFields/SearchField";
import SelectField from '../../components/textFields/SelectField';

// Replace options below with backend logic
const batchOptions = [
    { value: 'Batch 1', label: 'Batch 1' },
    { value: 'Batch 2', label: 'Batch 2' },
    { value: 'Batch 3', label: 'Batch 3' }
];

const yearOptions = [
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2023' },
    { value: '2022', label: '2024' },
    { value: '2021', label: '2025' },
];

function StudyLoad() {
    return (
        <div className='bg-white-yellow-tone h-[calc(100vh-80px)] overflow-hidden box-border flex flex-col pb-12 px-20'>            
            <div className="w-5/6 mx-auto mt-8">
                <div className="border border-dark-red bg-white rounded-md p-4 mb-8">
                    <h2 className="text-lg font-bold mb-4">Search School Period</h2>
                    <div className="flex flex-col space-y-4">
                        <SearchField name="period" id="period" placeholder="Search Period..." />
                        <div className="flex space-x-4">
                            <div className="flex-grow">
                                <SelectField className="w-full border rounded-md p-2" name="batch" id="batch" label="Select Batch" required={true} options={batchOptions}/>
                            </div>
                            <div className="flex-grow">
                                <SelectField className="w-full border rounded-md p-2" name="year" id="year" label="Select Year" required={true} options={yearOptions}/>
                            </div>
                            <ThinRedButton onClick={() => {}}>
                                <p className="text-xs">Search</p>
                            </ThinRedButton>
                        </div>
                    </div>
                </div>

<<<<<<< Updated upstream
                <div className="border border-dark-red rounded-md p-4 h-[60vh]">
                <h2 className="text-lg font-bold mb-4">Course Offered</h2>
                <div className='h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]'>
                    <div className='flex flex-row gap-7 items-center pb-4 border-b-2 border-black'>
                        {/* Replace with backend logic of name of student */}
                        <p className='text-xl uppercase grow'>Dolor, Polano I</p>
                    </div>
                    <table className='w-full table-fixed'>
                        <thead>
                            <tr className='border-b-2 border-[#828282]'>
                                <th className='py-3 font-bold'> Course </th>
                                <th className='py-3 font-bold'> Schedules </th>
                                <th className='py-3 font-bold'> Room </th>
                                <th className='py-3 font-bold'> # of Hours </th>
                                <th className='py-3 font-bold'> Students </th>
                                <th className='py-3 font-bold'> </th>
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
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Try to add props wherein it will get the data from that specific course so that modal can view the dets of that course*/}
        
                    
                </div>
=======
                <div className="border border-dark-red bg-white rounded-md p-4 h-[60vh]">
                    <h2 className="text-lg font-bold mb-4">Course Offered</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">No. of Students Enrolled</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-center">A1</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">TTh 6:30AM - 7:30AM</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">20</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-center">B1</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">TTh 6:30AM - 7:30AM</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">20</td>
                            </tr>
                        </tbody>
                    </table>
>>>>>>> Stashed changes
                </div>
            </div>
        </div>
    );
}

export default StudyLoad;