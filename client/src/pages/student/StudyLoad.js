import React from 'react';
import ThinRedButton from "../../components/buttons/ThinRedButton";
import SearchField from "../../components/textFields/SearchField";

function StudyLoad() {
    return (
        <div className="bg_custom bg-white-yellow-tone">
            <div className="w-5/6 mx-auto mt-8">
                <div className="border border-dark-red rounded-md p-4 mb-8">
                <h2 className="text-lg font-bold mb-4">Search Enrollment Period</h2>
                <div className="flex flex-col space-y-4">
                    <SearchField name="period" id="period" placeholder="Search Period..." />
                    <div className="flex space-x-4">
                    <div className="flex-grow">
                        <label>Batch</label>
                        <select className="w-full border rounded-md p-2">
                        <option value="">Select Batch</option>
                        {/* Add options here */}
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label>Year</label>
                        <input type="text" className="w-full border rounded-md p-2" placeholder="Year" />
                    </div>
                    <ThinRedButton onClick={() => {}}>
                        <p className="text-xs">Search</p>
                    </ThinRedButton>
                    </div>
                </div>
                </div>

                <div className="border border-dark-red rounded-md p-4 h-[60vh]">
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
                </div>
            </div>
        </div>
    );
}

export default StudyLoad;