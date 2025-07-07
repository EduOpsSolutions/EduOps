import React from 'react';
import { cn } from '../../utils/cn';

const PrimaryButton = ({ onClick, children, className }) => {
  return (
    <button
      type="button"
      className={cn(
        `mt-2 w-3/5 h-10 self-center size-8 font-bold bg-german-red text-white-yellow-tone text-xl drop-shadow-md hover:bg-dark-red-2 ease-in duration-150`,
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
