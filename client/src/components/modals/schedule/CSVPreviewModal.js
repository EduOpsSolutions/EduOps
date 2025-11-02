import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdCancel } from 'react-icons/md';

function CSVPreviewModal({
  isOpen,
  onClose,
  validationData,
  onConfirm,
  loading,
}) {
  const [localApproved, setLocalApproved] = useState([]);
  const [localRejected, setLocalRejected] = useState([]);
  const [localConflicts, setLocalConflicts] = useState([]);

  // Initialize local state when validationData changes
  useEffect(() => {
    if (validationData) {
      setLocalApproved(validationData.approved || []);
      setLocalRejected(validationData.rejected || []);
      setLocalConflicts(validationData.conflicts || []);
    }
  }, [validationData]);

  if (!isOpen || !validationData) return null;

  const { summary } = validationData;

  const moveConflictToRejected = (student) => {
    setLocalConflicts(prev => prev.filter(s => s.userId !== student.userId));
    setLocalRejected(prev => [...prev, {
      userId: student.userId,
      name: student.name,
      email: student.email,
      reason: 'Schedule conflict (manually excluded)'
    }]);
  };

  const handleConfirm = () => {
    // Pass the modified lists back to parent
    onConfirm({
      approved: localApproved,
      conflicts: localConflicts,
      rejected: localRejected
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">CSV Import Preview</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review the students before adding them to the schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-2 rounded border">
              <div className="text-2xl font-bold text-gray-800">
                {summary.total}
              </div>
              <div className="text-xs text-gray-600">Total IDs</div>
            </div>
            <div className="bg-white p-2 rounded border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {localApproved.length}
              </div>
              <div className="text-xs text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-2 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {localConflicts.length}
              </div>
              <div className="text-xs text-gray-600">Conflicts</div>
            </div>
            <div className="bg-white p-2 rounded border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {localRejected.length}
              </div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Approved Students */}
          {localApproved.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdCheckCircle className="text-green-600" size={20} />
                <h4 className="font-semibold text-green-800">
                  Approved Students ({localApproved.length})
                </h4>
              </div>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="text-left px-3 py-2 w-[20%]">
                        Student ID
                      </th>
                      <th className="text-left px-3 py-2 w-[40%]">Name</th>
                      <th className="text-left px-3 py-2 w-[40%]">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localApproved.map((student, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td
                          className="px-3 py-2 truncate"
                          title={student.userId}
                        >
                          {student.userId}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.name}>
                          {student.name}
                        </td>
                        <td
                          className="px-3 py-2 truncate"
                          title={student.email}
                        >
                          {student.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Students with Conflicts */}
          {localConflicts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdWarning className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-yellow-800">
                  Students with Schedule Conflicts ({localConflicts.length})
                </h4>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3 text-sm">
                <p className="text-yellow-800">
                  <strong>Note:</strong> These students have conflicting
                  schedules but can still be added if you proceed. Click the X button to exclude a student.
                </p>
              </div>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-50">
                    <tr>
                      <th className="text-left px-3 py-2 w-[15%]">
                        Student ID
                      </th>
                      <th className="text-left px-3 py-2 w-[22%]">Name</th>
                      <th className="text-left px-3 py-2 w-[22%]">Email</th>
                      <th className="text-left px-3 py-2 w-[31%]">
                        Conflict Details
                      </th>
                      <th className="text-center px-3 py-2 w-[10%]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {localConflicts.map((student, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td
                          className="px-3 py-2 truncate"
                          title={student.userId}
                        >
                          {student.userId}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.name}>
                          {student.name}
                        </td>
                        <td
                          className="px-3 py-2 truncate"
                          title={student.email}
                        >
                          {student.email}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {student.conflict.courseName}
                            </div>
                            <div className="text-gray-600">
                              {student.conflict.days} • {student.conflict.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => moveConflictToRejected(student)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                            title="Exclude from import"
                          >
                            <MdCancel size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rejected Students */}
          {localRejected.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdError className="text-red-600" size={20} />
                <h4 className="font-semibold text-red-800">
                  Rejected IDs ({localRejected.length})
                </h4>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">
                <p className="text-red-800">
                  <strong>Note:</strong> These IDs will not be added. Reasons
                  include: user not found, incompatible role (admin/teacher), schedule conflicts, or
                  already enrolled.
                </p>
              </div>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="text-left px-3 py-2 w-[20%]">ID</th>
                      <th className="text-left px-3 py-2 w-[30%]">Name</th>
                      <th className="text-left px-3 py-2 w-[30%]">Email</th>
                      <th className="text-left px-3 py-2 w-[20%]">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localRejected.map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 truncate" title={item.userId}>
                          {item.userId}
                        </td>
                        <td
                          className="px-3 py-2 truncate"
                          title={item.name || '—'}
                        >
                          {item.name || '—'}
                        </td>
                        <td
                          className="px-3 py-2 truncate"
                          title={item.email || '—'}
                        >
                          {item.email || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            {item.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {localApproved.length + localConflicts.length > 0 ? (
              <>
                <strong>{localApproved.length + localConflicts.length}</strong> student(s)
                will be added to the schedule
              </>
            ) : (
              'No valid students to add'
            )}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                loading || (localApproved.length === 0 && localConflicts.length === 0)
              }
              className="px-4 py-2 bg-dark-red-2 text-white rounded hover:bg-dark-red-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Adding Students...' : 'Confirm & Add Students'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CSVPreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  validationData: PropTypes.shape({
    approved: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        dbId: PropTypes.number,
      })
    ),
    rejected: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        reason: PropTypes.string,
      })
    ),
    conflicts: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        dbId: PropTypes.number,
        conflict: PropTypes.shape({
          courseName: PropTypes.string,
          days: PropTypes.string,
          time: PropTypes.string,
        }),
      })
    ),
    summary: PropTypes.shape({
      total: PropTypes.number,
      approved: PropTypes.number,
      rejected: PropTypes.number,
      conflicts: PropTypes.number,
    }),
  }),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CSVPreviewModal;
