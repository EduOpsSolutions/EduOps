import React from 'react';
import GrayButton from '../../buttons/GrayButton';

function SaveNotifyModal({ show, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-sm mx-4 relative shadow-lg">
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        <svg 
                            className="w-12 h-12 text-green-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="3" 
                                d="M5 13l4 4L19 7" 
                            />
                        </svg>
                    </div>
                    <p className="text-lg font-medium mb-6">
                        Your changes are saved successfully!
                    </p>
                    <div className="flex justify-center">
                        <GrayButton onClick={onClose}>
                            Close
                        </GrayButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SaveNotifyModal;