import React from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdCheckCircle, MdError, MdWarning } from 'react-icons/md';

function CSVPreviewModal({ isOpen, onClose, validationData, onConfirm, loading }) {
  if (!isOpen || !validationData) return null;

  const { approved, rejected, conflicts, summary } = validationData;

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
            <div className="bg-white p-3 rounded border">
              <div className="text-2xl font-bold text-gray-800">{summary.total}</div>
              <div className="text-xs text-gray-600">Total IDs</div>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
              <div className="text-xs text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-3 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{summary.conflicts}</div>
              <div className="text-xs text-gray-600">Conflicts</div>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-2xl font-bold text-red-600">{summary.rejected}</div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Approved Students */}
          {approved.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdCheckCircle className="text-green-600" size={20} />
                <h4 className="font-semibold text-green-800">
                  Approved Students ({approved.length})
                </h4>
              </div>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="text-left px-3 py-2 w-[20%]">Student ID</th>
                      <th className="text-left px-3 py-2 w-[40%]">Name</th>
                      <th className="text-left px-3 py-2 w-[40%]">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approved.map((student, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 truncate" title={student.userId}>
                          {student.userId}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.name}>
                          {student.name}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.email}>
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
          {conflicts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdWarning className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-yellow-800">
                  Students with Schedule Conflicts ({conflicts.length})
                </h4>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3 text-sm">
                <p className="text-yellow-800">
                  <strong>Note:</strong> These students have conflicting schedules but can still be added if you proceed.
                </p>
              </div>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-50">
                    <tr>
                      <th className="text-left px-3 py-2 w-[15%]">Student ID</th>
                      <th className="text-left px-3 py-2 w-[25%]">Name</th>
                      <th className="text-left px-3 py-2 w-[25%]">Email</th>
                      <th className="text-left px-3 py-2 w-[35%]">Conflict Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conflicts.map((student, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 truncate" title={student.userId}>
                          {student.userId}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.name}>
                          {student.name}
                        </td>
                        <td className="px-3 py-2 truncate" title={student.email}>
                          {student.email}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs">
                            <div className="font-medium">{student.conflict.courseName}</div>
                            <div className="text-gray-600">
                              {student.conflict.days} • {student.conflict.time}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rejected Students */}
          {rejected.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MdError className="text-red-600" size={20} />
                <h4 className="font-semibold text-red-800">
                  Rejected IDs ({rejected.length})
                </h4>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">
                <p className="text-red-800">
                  <strong>Note:</strong> These IDs will not be added. Reasons include: user not found, incompatible role (admin/teacher), or already enrolled.
                </p>
              </div>
              <div className="border rounded overflow-hidden">
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
                    {rejected.map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 truncate" title={item.userId}>
                          {item.userId}
                        </td>
                        <td className="px-3 py-2 truncate" title={item.name || '—'}>
                          {item.name || '—'}
                        </td>
                        <td className="px-3 py-2 truncate" title={item.email || '—'}>
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
            {approved.length + conflicts.length > 0 ? (
              <>
                <strong>{approved.length + conflicts.length}</strong> student(s) will be added to the schedule
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
              onClick={onConfirm}
              disabled={loading || (approved.length === 0 && conflicts.length === 0)}
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
