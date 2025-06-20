import React, { useState, useEffect } from 'react';
import Table from '../../components/tables/Table';
import Swal from 'sweetalert2';
import SearchField from '../../components/textFields/SearchField';
import DropDown from '../../components/form/DropDown';
import { getCookieItem } from '../../utils/jwt';
import axiosInstance from '../../utils/axios';

export default function AccountManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(null);
  const [role, setRole] = useState('');

  const fetchData = async () => {
    const token = getCookieItem('token');
    setError(null);
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: search,
            role: role,
          },
        }
      );
      setData(response.data.data);
    } catch (error) {
      setError(true);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response.data.message
          ? error.response.data.message
          : `Something went wrong! ${error.message}`,
      });
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [window.location.pathname]);

  return (
    <div className="bg_custom bg-white-yellow-tone flex flex-col">
      <p className="text-2xl font-bold w-full text-center pt-2">
        User Accounts
      </p>

      <div className="p-4 flex flex-col h-[6rem] w-[60%] mx-auto mt-2 rounded-md bg-white border-2 border-german-red">
        <div className="flex gap-4">
          <SearchField
            name="search"
            id="search"
            placeholder="Search by name, email, or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3"
            onClick={() => {
              fetchData();
            }}
          />

          <DropDown
            name="role"
            id="role"
            options={[
              { value: '', label: 'All' },
              { value: 'admin', label: 'Admin' },
              { value: 'student', label: 'Student' },
              { value: 'teacher', label: 'Teacher' },
            ]}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      <Table
        headers={[
          'ID',
          'First Name',
          'Middle Name',
          'Last Name',
          'Email',
          'Role',
          'Status',
          'Created At',
          'Updated At',
          'Deleted At',
        ]}
        className="w-[90%] mx-auto mt-4"
        data={data}
        isLoading={loading}
        isError={error}
      />
    </div>
  );
}
