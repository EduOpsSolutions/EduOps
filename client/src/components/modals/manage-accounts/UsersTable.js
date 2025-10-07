import React from 'react';

const UsersTable = ({ 
  data, 
  loading, 
  onUserClick, 
  formatDate, 
  getRoleDisplay, 
  getStatusDisplay, 
  getUserInitials, 
  getRoleBadgeColor, 
  getStatusBadgeColor 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
          <p className="text-lg">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  User
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Email
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Role
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Status
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Created At
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Updated At
                </th>
                <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                  Deleted At
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:shadow-sm"
                  onClick={() => onUserClick(user)}
                >
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 mr-3">
                        <div className="h-8 w-8 rounded-full bg-dark-red-2 flex items-center justify-center ring-2 ring-gray-200">
                          <span className="text-xs font-medium text-white">
                            {getUserInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-32 md:max-w-none" title={`${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}`}>
                          {user.firstName}{user.middleName ? ` ${user.middleName}` : ''} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-32 md:max-w-none" title={user.userId}>
                          ID: {user.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <div className="truncate max-w-32 md:max-w-none" title={user.email}>
                      {user.email}
                    </div>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {getStatusDisplay(user.status)}
                    </span>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={formatDate(user.createdAt)}>
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={formatDate(user.updatedAt)}>
                      {formatDate(user.updatedAt)}
                    </div>
                  </td>
                  <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                    <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={formatDate(user.deletedAt)}>
                      {user.deletedAt ? formatDate(user.deletedAt) : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && !loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UsersTable; 