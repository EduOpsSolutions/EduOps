import React, { useState, useEffect } from 'react';
import John_logo from '../../assets/images/John.jpg';
import Bg_image from '../../assets/images/Bg2.png';
import EditPasswordModal from '../../components/modals/common/EditPasswordModal';
import axios from 'axios';
import { MdClose } from "react-icons/md";
import {BsPencilFill} from 'react-icons/bs';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SmallButton from '../../components/buttons/SmallButton';
function Profile() {
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const [studentID, setStudentID] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [course, setCourse] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    // Fetch user details from the backend
    axios.get('/api/student/details')
      .then(response => {
        const { studentID, name, email, phoneNumber, course, birthday } = response.data;
        setStudentID(studentID);
        setName(name);
        setEmail(email);
        setPhoneNumber(phoneNumber);
        setCourse(course);
        setBirthday(birthday);
      })
      .catch(error => {
        console.error("There was an error fetching the user details!", error);
      });
  }, []);

  return (
    <section className='flex flex-col items-center justify-center bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply' style={{ backgroundImage: `url(${Bg_image})`, height: '100%' }}>
      <div className="flex flex-row w-full justify-center items-stretch">
      <div className="bg-white-yellow-tone rounded-2xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)] flex flex-col justify-center items-center m-5">
          <img src={John_logo} alt="" className="size-80 border-[3px] rounded-full mb-4" />
          <button className="py-2 px-4 rounded flex items-center text-lg hover:bg-gray-50">
            <BsPencilFill color='#5A5A5A' className="mr-2 text-2xl" />
            Edit Profile Picture
          </button>          
          <button className="py-2 px-4 rounded flex items-center text-lg hover:bg-gray-50 ">
            <MdClose color='#5A5A5A' className="mr-1 text-4xl" />
            Remove Photo
          </button>          
          <div className="flex space-x-2 pt-6">
            <SmallButton onClick={() => setEditPasswordModal(true)}>Change Password</SmallButton>
          </div>
        </div>
        <div className="bg-white-yellow-tone rounded-2xl py-8 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)] m-5">
          <h1 className="text-5xl font-bold mb-10">Name{name}</h1>
          <hr className="border-t-2 border-gray-400 mb-10" />
          <h2 className="text-4xl mb-10">Personal Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl mb-4">
                <strong>Student ID:</strong>
              </p>
                <p className='mb-7 text-lg'>
                studentID{studentID}
                </p>
              <p className="text-xl mb-4">
                <strong>Email:</strong>
              </p>
                <p className='mb-7 text-lg'>
                Email{email}
                </p>
              <p className="text-xl mb-4">
                <strong>Phone Number:</strong> 
              </p>
                <p className='text-lg mb-8'>
                Phone{phoneNumber}
              </p>
            </div>
            <div className='m-20 mt-0 mr-40'>
              <p className="text-xl mb-4">
                <strong>Course:</strong> {course}
              </p>
                <p className='mb-7 text-lg'>
                  Course
                  {course}
                </p>
              <p className="text-xl mb-4">
                <strong>Birthday:</strong> {birthday}
              </p>
                <p className='mb-7 text-lg'>
                  Birthday
                  {birthday}
                </p>
            </div>
          </div>
        </div>
      </div>
      <EditPasswordModal edit_password_modal={editPasswordModal} setEditPasswordModal={setEditPasswordModal} />
    </section>
  )
}

export default Profile;