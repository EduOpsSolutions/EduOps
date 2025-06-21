import React, { useState, useEffect } from 'react';
import { DatePicker } from '../../ui/DatePicker';

export default function UserAccountDetailsModal({
  data,
  show,
  handleClose,
  handleSave,
  loadingSave,
}) {
  const [formData, setFormData] = useState(data);
  const [date, setDate] = useState(null);

  useEffect(() => {
    setFormData(data);
    if (data?.birthmonth && data?.birthday && data?.birthyear) {
      setDate(
        new Date(`${data.birthmonth} ${data.birthday}, ${data.birthyear}`)
      );
    }
    console.log(date);
  }, [data]);

  if (!show) return null;

  return (
    <div
      id="user-account-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="relative p-4 w-full max-w-2xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <!-- Modal content --> */}
        <div className="relative bg-white rounded-lg shadow-sm">
          {/* <!-- Modal header --> */}
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              User Account Details
            </h3>
            <button
              type="button"
              className="text-german-red bg-transparent hover:bg-german-red duration-150 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="default-modal"
              onClick={handleClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* <!-- Modal body --> */}
          <div className="p-4 md:p-5 grid grid-cols-2 gap-4">
            <div className="">
              <label
                for="firstName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                First Name
              </label>
              <input
                type="firstName"
                id="firstName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
                value={formData?.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="">
              <label
                for="middleName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Middle Name
              </label>
              <input
                type="middleName"
                id="middleName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
                value={formData?.middleName}
                onChange={(e) =>
                  setFormData({ ...formData, middleName: e.target.value })
                }
                required
              />
            </div>

            <div className="">
              <label
                for="lastName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Last Name
              </label>
              <input
                type="lastName"
                id="lastName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
                value={formData?.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div className="">
              <label
                for="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
                value={formData?.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="">
              <label
                for="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Status
              </label>
              <select
                id="status"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={formData?.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="disabled">Inactive</option>
                <option value="deleted">Deleted</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* <div className="">
              <label
                for="birthDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Birth Date
              </label>
              <DatePicker
                date={date}
                setDate={setDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    birthmonth: e.target.value.getMonth() + 1,
                    birthday: e.target.value.getDate(),
                    birthyear: e.target.value.getFullYear(),
                  })
                }
              />
            </div> */}
          </div>
          {/* <!-- Modal footer --> */}
          <div className="flex items-center p-4 gap-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              data-modal-hide="default-modal"
              type="button"
              className="border-2 border-transparent hover:bg-transparent hover:border-german-red text-white hover:text-black bg-german-red font-medium rounded-lg text-sm px-5 py-2.5 text-center "
              onClick={() => handleSave(formData)}
              disabled={loadingSave}
            >
              {loadingSave ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save'
              )}
            </button>
            <button
              data-modal-hide="default-modal"
              type="button"
              onClick={handleClose}
              className="border-2 border-german-red hover:bg-german-red text-german-red hover:text-white bg-transparent font-medium rounded-lg text-sm px-5 py-2.5 text-center "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
