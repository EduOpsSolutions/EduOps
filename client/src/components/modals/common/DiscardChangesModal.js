import React from 'react';
import GrayButton from '../../buttons/GrayButton';
import SmallButton from '../../buttons/SmallButton';

function DiscardChangesModal({ show, onConfirm, onCancel }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-sm mx-4 relative shadow-lg">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Discard changes?</h3>
                    <p className="text-gray-700 mb-6">
                        If you leave, your changes will not be saved.
                    </p>
                    <div className="flex justify-center gap-4">
                        <GrayButton onClick={onCancel}>
                            Cancel
                        </GrayButton>
                        <SmallButton onClick={onConfirm}>
                            Discard
                        </SmallButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscardChangesModal;