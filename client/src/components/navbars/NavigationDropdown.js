import React from 'react';
import { Dropdown } from 'flowbite-react';
import { Link } from 'react-router-dom';
import useNavigationStore from '../../stores/navigationStore';

const NavigationDropdown = ({ label, items, className = "" }) => {
  const { closeCompactMenu } = useNavigationStore();
  if (!items || items.length === 0) return null;
  return (
    <Dropdown
      label=""
      className="w-fit font-semibold rounded-none bg-dark-red border-black mt-1"
      dismissOnClick={true}
      trigger="hover"
      renderTrigger={() => (
        <span className={`cursor-pointer hover:text-dark-red-4 text-base sm:text-lg font-bold ${className}`}>
          {label}
        </span>
      )}
    >
      <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-red border-t border-l border-black rotate-45"></div>
      
      {items.map((item, index) => (
        <Dropdown.Item
          key={index}
          as={Link}
          to={item.path}
          className="relative px-5 text-base justify-center text-white hover:bg-dark-red-4 focus:bg-dark-red-4"
          onClick={closeCompactMenu}
        >
          {item.label}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

export default NavigationDropdown; 