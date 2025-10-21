import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { MdSearch, MdExpandMore } from "react-icons/md";

/**
 * Searchable Academic Period Select Component
 * Allows searching academic periods by name, id, or dates with dropdown selection
 */
function AcademicPeriodSelect({ value, onChange, academicPeriods, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter academic periods based on search term
  const filteredPeriods = academicPeriods.filter((period) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const periodId = period.id?.toLowerCase() || "";
    const batchName = period.batchName?.toLowerCase() || "";

    return periodId.includes(searchLower) || batchName.includes(searchLower);
  });

  // Get selected academic period details
  const selectedPeriod = academicPeriods.find((p) => p.id === value);

  const handleSelect = (period) => {
    onChange(period);
    setIsOpen(false);
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDisplayName = (period) => {
    if (!period) return "Select academic period...";
    return `${period.batchName || "Unnamed Batch"}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Period Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
      >
        <span className={selectedPeriod ? "text-gray-900" : "text-gray-400"}>
          {getDisplayName(selectedPeriod)}
        </span>
        <MdExpandMore
          className={`text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          size={20}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
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

          {/* Academic Periods List */}
          <div className="overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading academic periods...
              </div>
            ) : filteredPeriods.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No academic periods found
              </div>
            ) : (
              filteredPeriods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => handleSelect(period)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedPeriod?.id === period.id
                      ? "bg-dark-red-2 bg-opacity-10 text-dark-red-2 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {period.batchName || "Unnamed Batch"}
                      </span>
                      <div className="flex gap-1">
                        {period.batchStatus && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              period.batchStatus === "ongoing"
                                ? "bg-green-100 text-green-700"
                                : period.batchStatus === "upcoming"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {period.batchStatus.charAt(0).toUpperCase() +
                              period.batchStatus.slice(1)}
                          </span>
                        )}
                        {period.enrollmentStatus && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              period.enrollmentStatus === "open"
                                ? "bg-green-100 text-green-700"
                                : period.enrollmentStatus === "upcoming"
                                ? "bg-yellow-100 text-yellow-700"
                                : period.enrollmentStatus === "closed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Enrollment:{" "}
                            {period.enrollmentStatus.charAt(0).toUpperCase() +
                              period.enrollmentStatus.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        ID: {period.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(period.startAt)} -{" "}
                        {formatDate(period.endAt)}
                      </span>
                    </div>
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

AcademicPeriodSelect.propTypes = {
  value: PropTypes.string, // Selected academic period ID
  onChange: PropTypes.func.isRequired, // Callback with selected period object
  academicPeriods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      batchName: PropTypes.string,
      startAt: PropTypes.string.isRequired,
      endAt: PropTypes.string.isRequired,
      batchStatus: PropTypes.oneOf(["upcoming", "ongoing", "ended"]),
      enrollmentStatus: PropTypes.oneOf([
        "upcoming",
        "open",
        "ended",
        "closed",
      ]),
      isEnrollmentClosed: PropTypes.bool,
      enrollmentOpenAt: PropTypes.string,
      enrollmentCloseAt: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

AcademicPeriodSelect.defaultProps = {
  value: null,
  isLoading: false,
};

export default AcademicPeriodSelect;
