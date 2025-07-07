import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function CommonModal({ title, handleClose, children, show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white-yellow-tone rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-start justify-between mb-4 sm:mb-6 p-6 sticky top-0 bg-white-yellow-tone z-10 border-b ">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">
            {title || 'View'}
          </h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={handleClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
