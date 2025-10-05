import React from 'react';

const SecondaryButton = ({ onClick, children }) => {
  return (
    <button
      type="button"
      className="mt-5 w-11/12 h-10 self-center font-bold bg-german-red text-white-yellow-tone lg:text-xl text-md drop-shadow-md hover:bg-dark-red-2 ease-in duration-150"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
