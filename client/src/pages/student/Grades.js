import React, { useState } from "react";
import Bg_image from '../../assets/images/Bg2.png';
import GradeNotReadyModal from "../../components/modals/grades/GradeNotReadyModal";

function Grades() {
    const [grade_not_ready_modal, setGradeNotReadyModal] = useState(false);


    return (
        <section className='flex flex-col items-start justify-start bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply h-full' style={{ backgroundImage: `url(${Bg_image})`}}>
            <div className="flex m-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
                <p className="text-3xl font-semibold ml-2">View Grades</p>
            </div>

            <div className='flex items-center justify-center'>
                <div className='h-[60vh] w-5/6 bg-white-yellow-tone rounded-xl px-4 border-black border-2'>
                    <table class="text-sm text-left text-black w-full mt-4 table-fixed bg-transparent">
                        <thead>
                            <tr className='border-b-2 border-b-dark-red-2'>
                                <th scope="col" class="px-6 py-2">
                                    Course Name
                                </th>
                                <th scope="col" class="px-6 py-2 text-center">
                                    Status
                                </th>
                                <th scope="col" class="px-6 py-2 text-center">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Todo: Insert backend to display courses enrolled */}
                            <tr class=" dark:bg-gray-500 dark:border-gray-700 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    B1 Aligemein Course
                                </td>
                                <td class="px-6 py-2 text-center">
                                    NO GRADE
                                </td>
                                {/* Add backend logic when If grade is == no grade, make the color of the icon grey */}
                                {/* Also, change icon later on for a better icon */}
                                <td class="px-6 py-2 flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-gray-300 size-6 cursor-pointer" onClick={() => setGradeNotReadyModal(true)}>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </td>
                            </tr>
                            {/* TODO: create a modal that displays the grades of the student with an ingrained file
                            viewer */}
                            <tr class=" dark:bg-gray-800 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    A2 German Basic Course
                                </td>
                                <td class="px-6 py-2 text-center">
                                    PASS
                                </td>
                                <td class="px-6 py-2 flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </td>
                            </tr>
                            <tr class=" dark:bg-gray-800 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    A1 German Basic Course
                                </td>
                                <td class="px-6 py-2 text-center">
                                    FAIL
                                </td>
                                <td class="px-6 py-2 flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </td>
                            </tr>
                            <tr class="dark:bg-gray-800 border-b border-b-gray-500">
                                <td class="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                    A1 German Basic Course
                                </td>
                                <td class="px-6 py-2 text-center">
                                    PASS
                                </td>
                                <td class="px-6 py-2 flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <GradeNotReadyModal
                        grade_not_ready_modal={grade_not_ready_modal}
                        setGradeNotReadyModal={setGradeNotReadyModal}
                    />
                </div>

            </div>
        </section>
    )
}

export default Grades