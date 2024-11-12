import React from "react";

const smallButton = ({ onClick, children }) => {
  return (
    <button
      type="submit"
      className="text-white bg-dark-red-5 hover:bg-dark-red focus:ring-4 focus:outline-none focus:ring-dark-red-5 font-bold rounded-lg text-sm w-full sm:w-auto px-14 py-2.5 text-center mx-auto shadow-sm shadow-black"
    >
      {children}
    </button>
  );
};

export default smallButton;
