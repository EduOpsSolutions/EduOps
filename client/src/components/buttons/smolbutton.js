import React from 'react';

const SmolButton = ({ onClick, children}) => {
    return (
        <button onClick={onClick} type="submit" className="text-white bg-dark-red-5 hover:bg-dark-red focus:ring-4 focus:outline-none focus:ring-dark-red-5 font-semibold rounded-md text-md w-full sm:w-auto px-12 py-2.5 text-center mx-auto shadow-sm shadow-black">
            {children}
        </button>
    );
};

export default SmolButton