import React from 'react';

const redButton = ({ onClick, children}) => {
    return (
        <button type="button" className="mt-5 w-5/12 h-10 self-center size-8 font-bold bg-german-red text-white-yellow hover:bg-dark-red-2 ease-in duration-150" onClick={onClick}>
            {children}
        </button>
    );
};

export default redButton