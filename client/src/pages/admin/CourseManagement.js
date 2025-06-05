import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import CreateCourseModal from '../../components/modals/courses/CreateCourseModal';
import EditCourseModal from '../../components/modals/courses/EditCourseModal';
import axiosInstance from '../../utils/axios';


function CourseManagement() {
  const [create_course_modal, setCreateCourseModal] = useState(false);
  const [edit_course_modal, setEditCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
        const response = await axiosInstance.get("/courses");
        setCourses(response.data);
    } catch (error) {
        console.error("Failed to fetch courses: ", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRowClick = (course) => {
    setSelectedCourse(course);
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


        <div className="flex flex-row space-x-80 my-8 pt-5 mr-40 w-1/8">
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
                            <th>Adviser</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} onClick={() => handleRowClick(course)} className="cursor-pointer hover:bg-gray-100">
                            <td>{course.id}</td>
                            <td>{course.name}</td>
                            <td>{course.maxNumber || 'N/A'}</td>
                            <td>{course.schedule || 'N/A'}</td>
                            <td>{course.category || 'N/A'}</td>
                            <td>{course.price || 'N/A'}</td>
                            <td>{course.visibility === 'visible' ? 'Visible' : 'Hidden'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
            <CreateCourseModal
                create_course_modal={create_course_modal}
                setCreateCourseModal={setCreateCourseModal}
                fetchCourses={fetchCourses}
            />
            <EditCourseModal 
                edit_course_modal={edit_course_modal} 
                setEditCourseModal={setEditCourseModal} 
                selectedCourse={selectedCourse}
                fetchCourses={fetchCourses}
            />
    </div>
    
 
)
}

export default CourseManagement