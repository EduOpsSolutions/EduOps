import React from 'react';

const SmallButton = ({
  onClick,
  children,
  disabled = false,
  type = 'submit',
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`text-white font-semibold rounded-md text-md sm:w-auto px-4 md:px-12 py-2.5 text-center mx-auto shadow-sm shadow-black ease-in duration-150 ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none'
      }`}
    >
      {children}
    </button>
  );
};

export default SmallButton;
