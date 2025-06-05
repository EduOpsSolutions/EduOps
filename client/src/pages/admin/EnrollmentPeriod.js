import React, { useState } from 'react';
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddCourseModal from '../../components/modals/enrollment/AddCourseModal';
import axiosInstance from '../../utils/axios';

function EnrollmentPeriod() {

  const [add_course_modal, setAddCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
        const response = await axiosInstance.get("/courses");
        const visibleCourses = response.data.filter(course => course.visibility === "visible");
        setCourses(visibleCourses);
    } catch (error) {
        console.error("Failed to fetch courses: ", error);
    }
  };

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
          <div className='flex items-center justify-between mb-2'>
            <svg className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => setAddCourseModal(true)}>
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#323232"></path> <path d="M9 12H15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 9L12 15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#323232" stroke-width="2"></path> </g>
            </svg>
            <h2 className="text-lg font-bold mb-4 text-center flex-1">Course Offered</h2>
            <div className='w-6 h-6'></div>
          </div>

          <hr className="border-t-2 border-red-300" /> 
          
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
      <AddCourseModal
        add_course_modal={add_course_modal}
        setAddCourseModal={setAddCourseModal}
        // fetchCourses={fetchCourses}
        />
    </div>
  )
}

export default EnrollmentPeriod;
