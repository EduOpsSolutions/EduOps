import React, { useState } from "react";
import Bg_image from '../../../assets/images/Bg2.png';
import ThinRedButton from "../../../components/buttons/ThinRedButton";
import GradeDetailsModal from "../../../components/modals/GradeDetailsModal";
import GradeNotReadyModal from '../../../components/modals/GradeNotReadyModal';

function Grades() {
    const [grade_not_ready_modal, setGradeNotReadyModal] = useState(false);
    const [grade_details_modal, setGradeDetailsModal] = useState(false);

    return (
        <section className='flex flex-col items-start justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <div className="flex m-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
                <p className="text-3xl font-semibold ml-2">Teacher View Grades</p>
            </div>

            <div className='flex items-center justify-center'>
                <div className='h-[60vh] w-5/6 bg-white-yellow-tone rounded-xl px-4 border-black border-2'>
                    <table class="text-sm text-left text-black w-full mt-4 table-fixed bg-transparent">
                        <thead>
                            <tr className='border-b-2 border-b-dark-red-2'>
                                <th scope="col" class="px-6 py-2">
                                    Course
                                </th>
                                <th scope="col" class="px-6 py-2 text-center">
                                    Schedule
                                </th>
                                <th scope="col" class="px-6 py-2 text-center">
                                    Room
                                </th>
                                <th scope="col" class="px-8 py-2 text-center">
                                    Students
                                </th>
                                <th scope="col" class="px-6 py-2 text-center">
                                    {/* Blank, for locking use */}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Todo: Insert backend to display courses enrolled */}
                            <tr class=" dark:bg-gray-500 dark:border-gray-700 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    A1
                                </td>
                                <td class="px-6 py-2 text-center">
                                    <p>Tth</p>
                                    <p>6:30AM - 7:30AM</p>
                                </td>
                                <td class="px-6 py-2 text-center">
                                    Room 01
                                </td>
                                <td class="px-6 py-2 text-center">
                                    
                                <ThinRedButton onClick={() => {
                                    ""
                                }}>
                                    <p className="text-xs">Grade Students</p>
                                </ThinRedButton>
                                </td>
                                {/* Add backend logic when If grade is == no grade, make the color of the icon grey */}
                                {/* Also, change icon later on for a better icon */}
                                <td class="px-6 py-2 text-center">
                                    
                                </td>
                            </tr>
                            <tr class=" dark:bg-gray-500 dark:border-gray-700 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    A1
                                </td>
                                <td class="px-6 py-2 text-center">
                                    <p>Tth</p>
                                    <p>6:30AM - 7:30AM</p>
                                </td>
                                <td class="px-6 py-2 text-center">
                                    Room 01
                                </td>
                                <td class="px-6 py-2 text-center">
                                    <ThinRedButton onClick={() => {
                                        ""
                                    }}>
                                        <p className="text-xs">Grade Students</p>
                                    </ThinRedButton>
                                </td>
                                <td class="px-6 py-2 text-center">
                                    <div className="flex justify-center items-center" title="This cannot be edited anymore. Contact your administrator">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                            
                        
                        </tbody>
                    </table>

                    <GradeNotReadyModal
                        grade_not_ready_modal={grade_not_ready_modal}
                        setGradeNotReadyModal={setGradeNotReadyModal}
                    />
                    
                    <GradeDetailsModal
                        grade_details_modal={grade_details_modal}
                        setGradeDetailsModal={setGradeDetailsModal}
                    />
                </div>

            </div>
        </section>
    )
}


export default Grades