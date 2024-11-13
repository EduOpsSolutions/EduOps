import React from 'react';

const ThinRedButton = ({ onClick, children}) => {
    return (
        <button onClick={onClick} type="submit" className="text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-md w-full sm:w-auto px-8 py-1.5 text-center mx-auto shadow-sm shadow-black ease-in duration-150">
            {children}
        </button>
    );
};

export default ThinRedButton