import React from 'react';

const SearchField = ({name, id, placeholder={}}) => {
    return (
        <div className="relative w-1/4">
            <input type="text" name={name} id={id} className="block py-2.5 w-full pl-4 text-sm text-gray-900 bg-white border border-dark-red-2 focus:outline-none focus:ring-0 focus:border-dark-red peer rounded-3xl" placeholder={placeholder}/>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => {}}>
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        </div>
    );
};

export default SearchField;
