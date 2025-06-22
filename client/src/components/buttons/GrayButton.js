import React from 'react';
import { cn } from '../../utils/cn';

const GrayButton = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      type="submit"
      className={cn(
        'text-black bg-grey-1 hover:bg-grey-2 font-semibold rounded-md text-md w-full sm:w-auto px-4 md:px-12 py-2.5 text-center mx-auto shadow-sm shadow-black',
        className
      )}
    >
      {children}
    </button>
  );
};

export default GrayButton;
