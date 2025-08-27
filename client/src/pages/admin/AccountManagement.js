import React, { useEffect } from 'react';
import SearchField from '../../components/textFields/SearchField';
import DropDown from '../../components/form/DropDown';
import Pagination from '../../components/common/Pagination';
import UserAccountDetailsModal from '../../components/modals/manage-accounts/UserAccountDetailsModal';
import StatisticsCards from '../../components/modals/manage-accounts/StatisticsCards';
import UsersTable from '../../components/modals/manage-accounts/UsersTable';
import useUserAccountStore from '../../stores/userAccountStore';

export default function AccountManagement() {
  const {
    data,
    loading,
    loadingSave,
    error,
    search,
    role,
    page,
    itemsPerPage,
    selectedUser,
    showUserAccountDetailsModal,
    stats,

    setSearch,
    setRole,
    setPage,
    setItemsPerPage,
    setSelectedUser,
    clearError,
    fetchData,
    handleSave,
    handleSearch,
    openUserModal,
    closeUserModal
  } = useUserAccountStore();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleDisplay = (role) => {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getStatusDisplay = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'teacher':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'student':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const roleDropdownOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
  ];

  useEffect(() => {
    fetchData();
  }, [role, page, itemsPerPage, fetchData]);

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">

          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">User Accounts</h1>
          </div>

          <StatisticsCards stats={stats} />

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="order-1 sm:order-1">
                <SearchField
                  name="search"
                  placeholder="Search by name, email, or role"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={handleSearch}
                  className="w-full sm:w-80"
                />
              </div>

              <div className="flex justify-center sm:justify-start w-full sm:w-auto order-2 sm:order-2 space-x-3">
                <DropDown
                  name="role"
                  id="role"
                  options={roleDropdownOptions}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-48"
                />
                <a
                  href="/admin/create-user"
                  className="bg-dark-red-2 text-white px-4 py-2 rounded-3xl hover:bg-dark-red-5 transition-colors duration-150 flex items-center"
                >
                  <span className="mr-1">+</span> Add User
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <UsersTable
              data={data.data}
              loading={loading}
              onUserClick={openUserModal}
              formatDate={formatDate}
              getRoleDisplay={getRoleDisplay}
              getStatusDisplay={getStatusDisplay}
              getUserInitials={getUserInitials}
              getRoleBadgeColor={getRoleBadgeColor}
              getStatusBadgeColor={getStatusBadgeColor}
            />

            {!loading && (
              <div className="mt-4">
                <Pagination
                  currentPage={data.page || 1}
                  totalPages={data.max_page || 1}
                  onPageChange={setPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={data.max_result || 0}
                  itemName="users"
                  showItemsPerPageSelector={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <UserAccountDetailsModal
        data={selectedUser}
        setData={setSelectedUser}
        show={showUserAccountDetailsModal}
        handleClose={closeUserModal}
        handleSave={handleSave}
        loadingSave={loadingSave}
      />
    </div>
  );
}