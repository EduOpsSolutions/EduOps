import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/SprachinsLogo.png';
import useNavigationStore from '../../stores/navigationStore';
import NotificationDropdown from './NotificationDropdown';
import UserActionsDropdown from './UserDropdown';
import NavigationDropdown from './NavigationDropdown';

function UserNavbar({ role }) {
  const { isCompactMenuOpen, toggleCompactMenu, getNavigationItems } = useNavigationStore();
  const navigationItems = getNavigationItems(role);

  const renderNavigationItem = (key, item) => {
    if (item.items) {
      return (
        <NavigationDropdown
          key={key}
          label={item.label}
          items={item.items}
        />
      );
    }

    return (
      <Link
        key={key}
        to={item.path}
        className="hover:text-dark-red-4 text-base sm:text-lg font-bold"
      >
        {item.label}
      </Link>
    );
  };

  if (role === 'public') {
    return (
      <nav className="w-full h-20 flex flex-row justify-center items-center bg-german-red text-white px-4 sm:px-8 py-2 border-b-[5px] border-dark-red-2 z-10 select-none">
        <div className="flex flex-wrap items-center justify-between mx-auto p-2">
          <a href="/" className="flex">
            <img src={logo} className="h-14 w-auto" alt="Logo" />
          </a>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full h-auto sm:h-20 flex flex-col sm:flex-row justify-between items-center bg-german-red text-white px-4 sm:px-8 py-2 border-b-[5px] border-dark-red-2 z-10 select-none">
      <div className="w-full sm:w-auto flex justify-between items-center">
        <Link to={`/${role}`} className="flex items-center">
          <img src={logo} alt="" className="h-16 w-auto" />
        </Link>

        <div className="sm:hidden flex items-center gap-2">
          <div className={`${isCompactMenuOpen ? 'flex' : 'hidden'} items-center gap-2`}>
            <NotificationDropdown isCompact={true} />
            <UserActionsDropdown role={role} isCompact={true} />
          </div>
          
          <button
            onClick={toggleCompactMenu}
            className="p-2 text-white hover:text-dark-red-4 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCompactMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={`${isCompactMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4 sm:gap-6 py-4 sm:py-0`}>
        {Object.entries(navigationItems).map(([key, item]) =>
          renderNavigationItem(key, item)
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <NotificationDropdown isCompact={false} />
        <UserActionsDropdown role={role} isCompact={false} />
      </div>
    </nav>
  );
}

export default UserNavbar;