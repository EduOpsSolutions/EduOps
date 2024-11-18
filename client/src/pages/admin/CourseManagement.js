import Cookies from 'js-cookie';
import React, { useState } from 'react';
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import CreateCourseModal from '../../components/modals/courses/CreateCourseModal';
import EditCourseModal from '../../components/modals/courses/EditCourseModal';


function Home() {
  const [create_course_modal, setCreateCourseModal] = useState(false);
  const [edit_course_modal, setEditCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleRowClick = (courseId) => {
    setSelectedCourseId(courseId);
    setEditCourseModal(true);
  };


return (
    <div class="bg_custom bg-white-yellow-tone">
        <div class="relative z-[2]">
            <div className="flex flex-col justify-center items-center">
                <div className="flex m-4">
                    <p className="text-6xl font-semibold ml-2">Courses</p>
                </div>
            </div>
        </div>


        <div className="flex flex-row space-x-40 items-center my-8 pt-5 mr-40 w-5/6">
            <ThinRedButton onClick={() => {setCreateCourseModal(true)}}>
                <p className="text-xs">Create Course</p>
            </ThinRedButton>
            <SearchField name="courses" id="courses" placeholder="Search Course"></SearchField>
        </div>

        <div className="flex flex-col justify-center items-center">
            <div className='h-[60vh] w-5/6 bg-white-yellow-tone px-5 border-dark-red border-2'>
                <table class="course-table mt-3 min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>Course Name</th>
                            <th># of Students</th>
                            <th>Schedule</th>
                            <th>Category</th>
                            <th>Adviser</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr onClick={() => {setEditCourseModal(true)}}>
                            <td>1</td>
                            <td>A1</td>
                            <td>10/15</td>
                            <td>TTh 6:30AM - 7:30AM</td>
                            <td>German Basic Course</td>
                            <td>Tricia Diaz</td>
                            <td>Visible</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
            <CreateCourseModal
                create_course_modal={create_course_modal}
                setCreateCourseModal={setCreateCourseModal}
            />
            <EditCourseModal 
                edit_course_modal={edit_course_modal} 
                setEditCourseModal={setEditCourseModal} 
                //selectedCourseId={selectedCourseId}
            />
    </div>
    
 
)
}

export default Home