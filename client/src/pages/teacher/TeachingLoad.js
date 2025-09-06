import React, { useState } from "react";
import ThinRedButton from '../../components/buttons/ThinRedButton';
import ViewStudentsModal from '../../components/modals/common/ViewStudentsModal';
import Pagination from '../../components/common/Pagination';

function TeachingLoad() {
    const [view_students_modal, setViewStudentsModal] = useState(false);
    const loadData = [
        { id: 1, code: 'A1', schedule: 'TTh', time: '6:30AM - 7:30AM', room: 'Room 01', hours: 1, students: '10/15' },
        { id: 2, code: 'A1', schedule: 'TTh', time: '9:30AM - 10:30AM', room: 'VR 02', hours: 1, students: '11/15' },
    ];
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalItems = loadData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = loadData.slice(startIndex, endIndex);

    const handlePageChange = (page) => setCurrentPage(page);
    const handleItemsPerPageChange = (newPerPage) => {
        setItemsPerPage(newPerPage);
        setCurrentPage(1);
    };

    return (
        <div className="bg_custom bg-white-yellow-tone min-h-screen">
            <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
                <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold break-words">
                            Teaching Load
                        </h1>
                    </div>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">Course</th>
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">Schedules</th>
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">Room</th>
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base"># of Hours</th>
                                        <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">Students</th>
                                        <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((load) => (
                                        <tr key={load.id} className="cursor-pointer transition-colors duration-150 hover:bg-gray-50">
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={load.code}>{load.code}</div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" title={`${load.schedule} ${load.time}`}>{`${load.schedule} - ${load.time}`}</div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div className="truncate max-w-20 sm:max-w-28 md:max-w-36 lg:max-w-none" title={load.room}>{load.room}</div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div>{load.hours}</div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base text-center">
                                                {load.students}
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base text-center">
                                                <ThinRedButton onClick={() => setViewStudentsModal(true)}>View Students</ThinRedButton>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-6 text-gray-500 text-sm md:text-base border-t border-b border-red-900">No loads found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            totalItems={totalItems}
                            itemName="loads"
                            showItemsPerPageSelector={true}
                        />
                    </div>
                    <ViewStudentsModal view_students_modal={view_students_modal} setViewStudentsModal={setViewStudentsModal} />
                </div>
            </div>
        </div>
    );
}

export default TeachingLoad;