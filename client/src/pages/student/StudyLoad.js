import React, { useState } from 'react';
import SearchForm from "../../components/common/SearchFormHorizontal";

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
    const [searchParams, setSearchParams] = useState({ batch: '', year: '' });
    const searchLogic = {
        searchParams,
        handleInputChange: (e) => {
            const { name, value } = e.target;
            setSearchParams(prev => ({ ...prev, [name]: value }));
        }
    };
    const searchFields = {
        title: 'SELECT SCHOOL PERIOD',
        formFields: [
            { name: 'batch', label: 'Batch', type: 'select', options: batchOptions },
            { name: 'year', label: 'Year', type: 'select', options: yearOptions }
        ]
    };
    const handleSearch = () => {
    };
    return (
        <div className='bg-white-yellow-tone w-full box-border flex flex-col px-4 sm:px-8 md:px-12 lg:px-20 overflow-x-hidden'>
            <div className="w-full max-w-screen-xl mx-auto mt-8 mb-8">
                <SearchForm
                    searchLogic={searchLogic}
                    fields={searchFields}
                    onSearch={handleSearch}
                />

                <div className='flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5'>
                    <div className='flex flex-row gap-7 items-center pb-4 border-b-2 border-dark-red-2'>
                        <p className='text-xl uppercase grow'>Dolor, Polano I</p>
                    </div>
                    <table className='w-full table-fixed'>
                        <thead>
                            <tr className='border-b border-dark-red-2 border-opacity-50'>
                                <th className='py-3 font-bold'> Course </th>
                                <th className='py-3 font-bold'> Schedule </th>
                                <th className='py-3 font-bold'> Adviser </th>
                                <th className='py-3 font-bold'> # of Hours </th>
                                <th className='py-3 font-bold'> Room </th>
                            </tr>
                        </thead>
                    </table>
                    {/* Replace code below with backend data */}
                    {/* Also, table below should be dynamic in height now */}
                    <table className='w-full table-fixed'>
                        <tbody>
                            <tr className='border-b border-dark-red-2 border-b-opacity-50'>
                                <td className='py-3 text-center'> A1 </td>
                                <td className='py-3 text-center'>
                                    <p>TTh</p>
                                    <p>6:30AM - 7:30AM</p>
                                </td>
                                <td className='py-3 text-center'> Tricia Diaz </td>
                                <td className='py-3 text-center'> 1 </td>
                                <td className='py-3 text-center'> Room 01 </td>
                            </tr>
                            <tr className='border-b border-dark-red-2 border-b-opacity-50'>
                                <td className='py-3 text-center'> A2 </td>
                                <td className='py-3 text-center'>
                                    <p>TTh</p>
                                    <p>9:30AM - 10:30AM</p>
                                </td>
                                <td className='py-3 text-center'> Arthur Morgan </td>
                                <td className='py-3 text-center'> 1 </td>
                                <td className='py-3 text-center'> VR 02 </td>
                            </tr>
                            <tr className='border-b border-dark-red-2 border-b-opacity-50'>
                                <td className='py-3 text-center'> A1 </td>
                                <td className='py-3 text-center'>
                                    <p>TTh</p>
                                    <p>6:30AM - 7:30AM</p>
                                </td>
                                <td className='py-3 text-center'> Tricia Diaz </td>
                                <td className='py-3 text-center'> 1 </td>
                                <td className='py-3 text-center'> Room 01 </td>
                            </tr>
                            <tr className='border-b border-dark-red-2 border-b-opacity-50'>
                                <td className='py-3 text-center'> A2 </td>
                                <td className='py-3 text-center'>
                                    <p>TTh</p>
                                    <p>9:30AM - 10:30AM</p>
                                </td>
                                <td className='py-3 text-center'> Arthur Morgan </td>
                                <td className='py-3 text-center'> 1 </td>
                                <td className='py-3 text-center'> VR 02 </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StudyLoad;