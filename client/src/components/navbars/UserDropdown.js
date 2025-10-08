import React, { useState, useEffect } from 'react';
import { Dropdown } from 'flowbite-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useNavigationStore from '../../stores/navigationStore';

const UserActionsDropdown = ({ role, isCompact = false }) => {
  const { logout, getUser } = useAuthStore();
  const { closeCompactMenu } = useNavigationStore();
  const user = getUser();
  const userInitials = String(user?.firstName || '').slice(0, 2).toUpperCase();
  const [profilePic, setProfilePic] = useState(null);

  const avatarSize = isCompact ? "size-[40px]" : "size-[48px]";
  const textSize = isCompact ? "text-lg" : "text-xl";

  // Load profile picture from localStorage or user data
  useEffect(() => {
    const cachedProfilePic = localStorage.getItem('profilePicLink');
    if (cachedProfilePic && cachedProfilePic !== 'null' && cachedProfilePic !== 'undefined') {
      setProfilePic(cachedProfilePic);
    } else if (user?.profilePicLink) {
      setProfilePic(user.profilePicLink);
      localStorage.setItem('profilePicLink', user.profilePicLink);
    }
  }, [user?.profilePicLink]);

  return (
    <Dropdown
      label=""
      className="w-fit font-semibold rounded-none bg-dark-red border-none"
      dismissOnClick={true}
      trigger="hover"
      renderTrigger={() => (
        profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className={`${avatarSize} rounded-full object-cover cursor-pointer border-2`}
          />
        ) : (
          <span className={`${avatarSize} flex justify-center items-center font-bold ${textSize} border-2 rounded-full cursor-pointer`}>
            {userInitials}
          </span>
        )
      )}
    >
      <Dropdown.Item
        as={Link}
        to={`/${role}/profile`}
        className="text-base text-white hover:bg-dark-red-4 focus:bg-dark-red-4"
        onClick={() => isCompact && closeCompactMenu()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 me-3"
        >
          <path
            fillRule="evenodd"
            d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            clipRule="evenodd"
          />
        </svg>
        View Profile
      </Dropdown.Item>

      <Dropdown.Item
        as={Link}
        onClick={() => {
          logout();
          isCompact && closeCompactMenu();
        }}
        to="/login"
        className="text-base text-white hover:bg-dark-red-4 focus:bg-dark-red-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 me-3"
        >
          <path
            fillRule="evenodd"
            d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
        Logout
      </Dropdown.Item>

      <Dropdown.Divider className="bg-black mx-4" />

      <Dropdown.Item className="text-xs text-white hover:bg-transparent focus:bg-transparent">
        <Link
          to={`/${role}/legal/terms`}
          className=""
          onClick={() => isCompact && closeCompactMenu()}
        >
          Terms
        </Link>
        <span className="mx-1"> • </span>
        <Link
          to={`/${role}/legal/privacy-policy`}
          className=""
          onClick={() => isCompact && closeCompactMenu()}
        >
          Privacy
        </Link>
        <span className="mx-1"> • </span>
        <span> EduOps © 2024 </span>
      </Dropdown.Item>
    </Dropdown>
  );
};

export default UserActionsDropdown; 