import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdSearch, MdExpandMore } from 'react-icons/md';

/**
 * Searchable Teacher Select Component
 * Allows searching teachers by name or ID with dropdown selection
 */
function TeacherSelect({ value, onChange, teachers, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const userId = teacher.userId?.toLowerCase() || '';

    return fullName.includes(searchLower) || userId.includes(searchLower);
  });

  // Get selected teacher details
  const selectedTeacher = teachers.find((t) => t.id === value);

  const handleSelect = (teacher) => {
    onChange(teacher);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayName = (teacher) => {
    if (!teacher) return 'Select teacher...';
    return `${teacher.firstName} ${teacher.lastName}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Teacher Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
      >
        <span className={selectedTeacher ? 'text-gray-900' : 'text-gray-400'}>
          {getDisplayName(selectedTeacher)}
        </span>
        <MdExpandMore
          className={`text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          size={20}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full z-50 w-full mt-1 bg-white border border-gray-500 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Teachers List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading teachers...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No teachers found
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelect(teacher)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedTeacher?.id === teacher.id
                      ? 'bg-dark-red-2 bg-opacity-10 text-dark-red-2 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {teacher.userId}
                      {teacher.email && ` • ${teacher.email}`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

TeacherSelect.propTypes = {
  value: PropTypes.string, // Selected teacher ID
  onChange: PropTypes.func.isRequired, // Callback with selected teacher object
  teachers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

TeacherSelect.defaultProps = {
  value: null,
  isLoading: false,
};

export default TeacherSelect;
