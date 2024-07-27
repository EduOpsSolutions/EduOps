import React from 'react';

const GrayButton = ({ onClick, children}) => {
    return (
        <button onClick={onClick} type="submit" className="text-black bg-grey-1 hover:bg-grey-2 font-semibold rounded-md text-md w-full sm:w-auto px-12 py-2.5 text-center mx-auto shadow-sm shadow-black">
            {children}
        </button>
    );
};

export default GrayButton