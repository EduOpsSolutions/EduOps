import React, { useState } from "react";
import Bg_image from '../../../assets/images/Bg2.png';
import ThinRedButton from "../../../components/buttons/ThinRedButton";
import GradeDetailsModal from "../../../components/modals/GradeDetailsModal";
import GradeNotReadyModal from '../../../components/modals/GradeNotReadyModal';
import SearchField from "../../../components/textFields/SearchField";

function Grades() {
    const [grade_not_ready_modal, setGradeNotReadyModal] = useState(false);
    const [grade_details_modal, setGradeDetailsModal] = useState(false);

    return (
        <section className='flex flex-col items-start justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, minHeight: '100vh'}}>
            <div className="flex m-4">
                <p className="text-3xl font-semibold ml-2">Grades</p>
            </div>

            <div className='flex items-center justify-center'>
                <div className='h-[60vh] w-5/6 bg-white-yellow-tone rounded-xl px-4 border-black border-2'>
                    <form action="">
                        <div className="flex flex-row space-x-14 items-center my-2">
                            <p>Select Course</p>
                            <SearchField name="courses" id="courses" placeholder="Search Course"></SearchField>
                        </div>
                    </form>
                    <hr className="border border-dark-red-2"/>
                    <table class="text-sm text-left text-black w-full table-fixed bg-transparent">
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
                                    VR 02
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