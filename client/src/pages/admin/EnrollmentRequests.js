import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";

function EnrollmentRequests() {
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollmentRequests();
  }, []);

  const fetchEnrollmentRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/enrollment-request');
      if (!response.data.error) {
        setEnrollmentRequests(response.data.data);
      } else {
        console.error('Error fetching enrollment requests:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="relative z-[2]">
        <div className="flex flex-col justify-center items-center">
          <div className="flex m-4">
            <p className="text-6xl font-semibold ml-2">Enrollment Requests</p>
          </div>
        </div>
      </div>

      <div className="w-5/6 mx-auto">
        <div className="flex flex-row justify-between items-center my-8 pt-5">
          <SearchField name="enrollment" id="enrollment" placeholder="Search User" className="flex-grow"></SearchField>
          <div className="flex-shrink-0">
            <ThinRedButton onClick={() => {}}>
              <p className="text-xs">End Enrollment</p>
            </ThinRedButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        <div className='h-[60vh] w-5/6 bg-white-yellow-tone px-5 border-dark-red border-2'>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              Loading enrollment requests...
            </div>
          ) : (
            <table className="course-table mt-3 min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Balance</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">O.R.</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollmentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.courses}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.amountBalance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.amountPaid}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.or}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.step}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button><i className="fas fa-eye"></i></button>
                        <button><i className="fas fa-edit"></i></button>
                        <button><i className="fas fa-info-circle"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnrollmentRequests;