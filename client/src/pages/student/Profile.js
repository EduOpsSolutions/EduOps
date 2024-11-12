import React, { useState, useEffect } from 'react';
import John_logo from '../../assets/images/John.jpg';
import Bg_image from '../../assets/images/Bg2.png';
import EditPasswordModal from '../../components/modals/EditPasswordModal';
import axios from 'axios';

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
      <div className="flex flex-row">
        <div className="mb-14 bg-white-yellow-tone rounded-2xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)] flex flex-col justify-center items-center" style={{ marginRight: '50px' }}>
          <img src={John_logo} alt="" className="size-80 border-[3px] rounded-full mb-4" />
          <button className="py-2 px-4 rounded">Edit Profile Picture</button>
          <button className="py-2 px-4 rounded mb-6">Remove Photo</button>
          <div className="flex space-x-2">
            <button className="bg-german-red text-white py-2 px-4 rounded" onClick={() => setEditPasswordModal(true)}>Change Password</button>
          </div>
        </div>
        <div className="bg-white-yellow-tone rounded-2xl p-10 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
          <h1 className="text-6xl font-bold mb-6">{name}</h1>
          <h2 className="text-2xl mb-4">Personal Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2">
                <strong>Student ID:</strong> {studentID}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {email}
              </p>
              <p className="mb-2">
                <strong>Phone Number:</strong> {phoneNumber}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Course:</strong> {course}
              </p>
              <p className="mb-2">
                <strong>Birthday:</strong> {birthday}
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