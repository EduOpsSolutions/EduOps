import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';

/**
 * Calendar Settings Modal
 * Allows users to customize calendar display preferences
 */
function CalendarSettingsModal({ isOpen, onClose, onSettingsChange }) {
  const [timeFormat, setTimeFormat] = useState('12h');
  const [viewDensity, setViewDensity] = useState('default');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTimeFormat = localStorage.getItem('calendarTimeFormat') || '12h';
    const savedViewDensity = localStorage.getItem('calendarViewDensity') || 'default';

    setTimeFormat(savedTimeFormat);
    setViewDensity(savedViewDensity);
  }, []);

  const handleTimeFormatChange = (format) => {
    setTimeFormat(format);
    localStorage.setItem('calendarTimeFormat', format);
    onSettingsChange({ timeFormat: format, viewDensity });
  };

  const handleViewDensityChange = (density) => {
    setViewDensity(density);
    localStorage.setItem('calendarViewDensity', density);
    onSettingsChange({ timeFormat, viewDensity: density });
  };

  const handleReset = () => {
    setTimeFormat('12h');
    setViewDensity('default');
    localStorage.setItem('calendarTimeFormat', '12h');
    localStorage.setItem('calendarViewDensity', 'default');
    onSettingsChange({ timeFormat: '12h', viewDensity: 'default' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Calendar Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Time Format Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Time Format
            </label>
            <div className="space-y-2">
              <button
                onClick={() => handleTimeFormatChange('12h')}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  timeFormat === '12h'
                    ? 'border-dark-red-2 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">12-hour format</div>
                    <div className="text-sm text-gray-500">9:00 AM, 2:30 PM</div>
                  </div>
                  {timeFormat === '12h' && (
                    <div className="w-5 h-5 rounded-full bg-dark-red-2 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleTimeFormatChange('24h')}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  timeFormat === '24h'
                    ? 'border-dark-red-2 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">24-hour format</div>
                    <div className="text-sm text-gray-500">09:00, 14:30</div>
                  </div>
                  {timeFormat === '24h' && (
                    <div className="w-5 h-5 rounded-full bg-dark-red-2 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* View Density Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              View Density
            </label>
            <div className="space-y-2">
              <button
                onClick={() => handleViewDensityChange('compact')}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  viewDensity === 'compact'
                    ? 'border-dark-red-2 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Compact</div>
                    <div className="text-sm text-gray-500">Smaller spacing, more events visible</div>
                  </div>
                  {viewDensity === 'compact' && (
                    <div className="w-5 h-5 rounded-full bg-dark-red-2 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleViewDensityChange('default')}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  viewDensity === 'default'
                    ? 'border-dark-red-2 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Default</div>
                    <div className="text-sm text-gray-500">Standard spacing and sizing</div>
                  </div>
                  {viewDensity === 'default' && (
                    <div className="w-5 h-5 rounded-full bg-dark-red-2 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-red-2 hover:bg-dark-red-3 text-white rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

CalendarSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSettingsChange: PropTypes.func.isRequired,
};

export default CalendarSettingsModal;
