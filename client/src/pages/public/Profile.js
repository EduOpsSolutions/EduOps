import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BsPencilFill } from 'react-icons/bs';
import { MdClose } from 'react-icons/md';
import Bg_image from '../../assets/images/Bg2.png';
import John_logo from '../../assets/images/John.jpg';
import SmallButton from '../../components/buttons/SmallButton';
import EditPasswordModal from '../../components/modals/common/EditPasswordModal';
import useAuthStore from '../../stores/authStore';
import Swal from 'sweetalert2';

function Profile({ role }) {
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const { user, getUserFullName, getBirthday } = useAuthStore();
  const userRole = role || user.role;

  return (
    <section
      className="flex flex-col items-center justify-center bg-white-yellow-tone bg-center bg-cover bg-repeat bg-blend-multiply landscape:h-screen h-fit"
      style={{ backgroundImage: `url(${Bg_image})` }}
    >
      <div className="flex md:flex-row flex-col w-full justify-center items-stretch">
        {/* Profile Picture Card */}
        <div className="bg-white-yellow-tone rounded-lg py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)] flex flex-col justify-center items-center m-5">
          <img
            src={John_logo}
            alt=""
            className="aspect-square size-[18rem] border-[3px] rounded-full mb-4 object-cover"
          />
          <button className="py-1 px-4 rounded flex items-center text-lg hover:text-dark-red-2">
            <BsPencilFill className="mr-2 text-2xl" />
            Edit Profile Picture
          </button>
          <button className="py-1 px-2 rounded flex items-center text-lg hover:text-dark-red-2">
            <MdClose className="mr-1 text-4xl" />
            Remove Photo
          </button>
          <div className="flex space-x-2 pt-6">
            <SmallButton onClick={() => setEditPasswordModal(true)}>
              Change Password
            </SmallButton>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white-yellow-tone rounded-lg py-4 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
          <h1 className="text-2xl font-bold mb-5">{getUserFullName()}</h1>
          <hr className="border-t-2 border-black mb-4" />
          <h2 className="text-3xl mb-4">Personal Details</h2>

          {/* Students Layout */}

          {userRole === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl mb-4 font-bold">Student ID:</p>
                <p className="mb-7">{user.userId}</p>
                <p className="text-2xl mb-4 font-bold">Email:</p>
                <p className="mb-7">{user.email}</p>
                <p className="text-2xl mb-4 font-bold">Phone Number:</p>
                <p className="mb-8">{user.phoneNumber || 'N/A'}</p>
              </div>
              <div className="m-20 mt-0 mr-40">
                <p className="text-2xl mb-4 font-bold">Course:</p>
                <p className="mb-7">{user.course || 'N/A'}</p>
                <p className="text-2xl mb-4 font-bold">Birthday:</p>
                <p className="mb-7">{getBirthday()}</p>
              </div>
            </div>
          )}

          {/* Teacher and Admin Layout */}
          {['teacher', 'admin'].includes(userRole) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl mb-4 font-bold">Email:</p>
                <p className="mb-7">{user.email}</p>
                <p className="text-2xl mb-4 font-bold">Phone Number:</p>
                <p className="mb-8">{user.phoneNumber || 'N/A'}</p>
              </div>

              <div className="m-20 mt-0">
                <p className="text-2xl mb-4 font-bold">Birthday:</p>
                <p className="mb-7 w-full">{getBirthday()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <EditPasswordModal
        edit_password_modal={editPasswordModal}
        setEditPasswordModal={setEditPasswordModal}
      />
    </section>
  );
}

export default Profile;
