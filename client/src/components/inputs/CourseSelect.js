import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdSearch, MdExpandMore } from 'react-icons/md';

/**
 * Searchable Course Select Component
 * Allows searching courses by name or ID with dropdown selection
 */
function CourseSelect({ value, onChange, courses, isLoading }) {
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

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const courseName = course.name?.toLowerCase() || '';
    const courseId = course.id?.toLowerCase() || '';

    return courseName.includes(searchLower) || courseId.includes(searchLower);
  });

  // Get selected course details
  const selectedCourse = courses.find((c) => c.id === value);

  const handleSelect = (course) => {
    onChange(course);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayName = (course) => {
    if (!course) return 'Select course...';
    return course.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Course Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
      >
        <span className={selectedCourse ? 'text-gray-900' : 'text-gray-400'}>
          {getDisplayName(selectedCourse)}
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
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
                placeholder="Search by course name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Courses List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No courses found
              </div>
            ) : (
              filteredCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelect(course)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedCourse?.id === course.id
                      ? 'bg-dark-red-2 bg-opacity-10 text-dark-red-2 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{course.name}</span>
                    {course.description && (
                      <span className="text-sm text-gray-500 truncate">
                        {course.description}
                      </span>
                    )}
                    {course.price && (
                      <span className="text-xs text-gray-400 mt-1">
                        Price: ${parseFloat(course.price).toFixed(2)}
                      </span>
                    )}
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

CourseSelect.propTypes = {
  value: PropTypes.string, // Selected course ID
  onChange: PropTypes.func.isRequired, // Callback with selected course object
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      visibility: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

CourseSelect.defaultProps = {
  value: null,
  isLoading: false,
};

export default CourseSelect;
