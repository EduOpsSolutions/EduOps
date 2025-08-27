import React, { useState, useEffect } from 'react';
import { BsPersonFill, BsEnvelopeFill, BsPhoneFill, BsCakeFill, BsBookFill } from 'react-icons/bs';
import EditPasswordModal from '../../components/modals/common/EditPasswordModal';
import ImageUploadField from '../../components/form/ImageUploadField';
import useAuthStore from '../../stores/authStore';
import useProfileStore from '../../stores/profileStore';
import LabelledInputField from '../../components/textFields/LabelledInputField';

function Profile({ role }) {
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const { user, getUserFullName, getBirthday, setUser } = useAuthStore();

  const {
    profileImagePreview,
    uploadingImage,
    hasChanges,
    resetKey,
    setProfileImage,
    removeProfileImage,
    cancelChanges,
    saveProfilePicture,
    resetState,
  } = useProfileStore();

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const userRole = role || user.role;

  const handleImageChange = async (file, previewUrl) => {
    setProfileImage(file, previewUrl);
  };

  const handleImageRemove = async () => {
    removeProfileImage();
  };

  const handleSaveProfilePicture = async () => {
    await saveProfilePicture(user, setUser);
  };

  const handleCancelChanges = () => {
    cancelChanges();
  };

  return (
    <div className="bg_custom bg-white-yellow-tone min-h-screen">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-5xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8">

          {/* Profile Summary Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">

              {/* Profile Picture Section */}
              <div className="flex-shrink-0">
                <ImageUploadField
                  key={resetKey}
                  currentImage={profileImagePreview || user.profilePicLink || `${user.firstName} ${user.lastName}`}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  disabled={uploadingImage}
                  className="mb-0"
                />
                {hasChanges && !uploadingImage && (
                  <div className="text-center mt-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-200">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                      Changes Pending
                    </div>
                  </div>
                )}
                {uploadingImage && (
                  <div className="text-center mt-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-800 mr-2"></div>
                      Uploading...
                    </div>
                  </div>
                )}
              </div>

              {/* User Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {getUserFullName()}
                </h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <BsPersonFill className="mr-1" />
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                  </span>
                  {user.course && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      <BsBookFill className="mr-1" />
                      {user.course}
                    </span>
                  )}
                </div>
                <div className="text-gray-600 space-y-1">
                  <div className="flex items-center justify-center lg:justify-start">
                    <BsEnvelopeFill className="mr-2 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <BsPhoneFill className="mr-2 text-gray-400" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {getBirthday() && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <BsCakeFill className="mr-2 text-gray-400" />
                      <span>{getBirthday()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setEditPasswordModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-dark-red-2 text-white rounded-lg hover:bg-dark-red-5 transition-colors duration-150"
                >
                  Change Password
                </button>
                {hasChanges && (
                  <>
                    <button
                      onClick={handleSaveProfilePicture}
                      disabled={uploadingImage}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      onClick={handleCancelChanges}
                      disabled={uploadingImage}
                      className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                View Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Student-specific fields */}
              {userRole === 'student' && (
                <div className="col-span-1 md:col-span-2">
                  <LabelledInputField
                    name="userId"
                    id="userId"
                    label="Student ID"
                    type="text"
                    value={user.userId}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>
              )}
              
              <div>
                <LabelledInputField
                  name="firstName"
                  id="firstName"
                  label="First Name"
                  type="text"
                  value={user.firstName}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>

              <div>
                <LabelledInputField
                  name="lastName"
                  id="lastName"
                  label="Last Name"
                  type="text"
                  value={user.lastName}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>

              <div>
                <LabelledInputField
                  name="email"
                  id="email"
                  label="Email Address"
                  type="email"
                  value={user.email}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>

              <div>
                <LabelledInputField
                  name="phoneNumber"
                  id="phoneNumber"
                  label="Phone Number"
                  type="text"
                  value={user.phoneNumber || 'Not specified'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>

              {userRole === 'student' && (
                <div>
                  <LabelledInputField
                    name="course"
                    id="course"
                    label="Course"
                    type="text"
                    value={user.course || 'Not specified'}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>
              )}

              <div>
                <LabelledInputField
                  name="birthday"
                  id="birthday"
                  label="Birthday"
                  type="text"
                  value={getBirthday() || 'Not specified'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Information Panel */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 text-blue-600 mt-0.5">
                  ℹ️
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Profile Information:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Personal information can only be updated by system administrators</li>
                    <li>• Contact your administrator if any information needs to be changed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Password Modal */}
      <EditPasswordModal
        edit_password_modal={editPasswordModal}
        setEditPasswordModal={setEditPasswordModal}
      />
    </div>
  );
}

export default Profile;