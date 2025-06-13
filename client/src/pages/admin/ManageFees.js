import React, { useState } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddFeeModal from "../../components/modals/transactions/GenAddFeesModal";
import DiscardChangesModal from "../../components/modals/common/DiscardChangesModal";
import SaveChangesModal from "../../components/modals/common/SaveChangesModal";
import SaveNotifyModal from "../../components/modals/common/SaveNotif";

function ManageFees() {
  const [fees, setFees] = useState([
    {
      id: 1,
      description: "COURSE FEE",
      amount: "25,850.00",
      dueDate: "May 30, 2024",
    },
    {
      id: 2,
      description: "BOOKS",
      amount: "2,800.00",
      dueDate: "May 30, 2024",
    },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFees, setEditedFees] = useState([]);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveNotifyModal, setShowSaveNotifyModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleEditFees = () => {
    setIsEditMode(true);
    setEditedFees([...fees]);
  };

  const handleAddFees = () => {
    setShowAddFeeModal(true);
  };

  const handleCloseAddFeeModal = () => {
    setShowAddFeeModal(false);
  };

  const handleAddFee = (newFee) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formattedFee = {
      ...newFee,
      id: Math.max(...fees.map((f) => f.id), 0) + 1,
      amount: parseFloat(newFee.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      dueDate: formatDate(newFee.dueDate),
    };

    setFees((prev) => [...prev, formattedFee]);
    setShowAddFeeModal(false);
  };

  const handleInputChange = (id, field, value) => {
    setEditedFees((prev) =>
      prev.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee))
    );
  };

  const handleConfirm = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    setFees([...editedFees]);
    setIsEditMode(false);
    setShowSaveModal(false);
    setShowSaveNotifyModal(true);
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const handleCloseSaveNotify = () => {
    setShowSaveNotifyModal(false);
  };

  const handleDiscard = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = () => {
    setEditedFees([]);
    setIsEditMode(false);
    setShowDiscardModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleFieldUndo = (id, field) => {
    const originalFee = fees.find((fee) => fee.id === id);
    if (originalFee) {
      setEditedFees((prev) =>
        prev.map((fee) =>
          fee.id === id ? { ...fee, [field]: originalFee[field] } : fee
        )
      );
    }
  };

  const hasFieldChanged = (id, field) => {
    const originalFee = fees.find((fee) => fee.id === id);
    const editedFee = editedFees.find((fee) => fee.id === id);
    return originalFee && editedFee && originalFee[field] !== editedFee[field];
  };

  return (
    <>
      <div className="bg-white-yellow-tone h-full flex flex-col py-16 px-20">
        <div className="flex flex-row gap-16">
          <div className="h-fit grow-0 basis-3/12 bg-white border-dark-red-2 border-2 rounded-lg p-7 shadow-[0_4px_3px_0_rgba(0,0,0,0.5)]">
            <form className="flex flex-col gap-7" onSubmit={handleSearch}>
              <div className="flex flex-row gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-semibold">SEARCH</p>
              </div>
              <div>
                <p className="mb-1">Course</p>
                <select
                  name="course"
                  id="course"
                  className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black"
                >
                  <option value="A1">A1 German Basic Course</option>
                  <option value="A2">A2 German Basic Course</option>
                  <option value="A3">A3 German Basic Course</option>
                </select>
              </div>
              <div>
                <p className="mb-1">Batch</p>
                <select
                  name="batch"
                  id="batch"
                  className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black"
                >
                  <option value="B1">Batch 1</option>
                  <option value="B2">Batch 2</option>
                  <option value="B3">Batch 3</option>
                </select>
              </div>
              <div>
                <p className="mb-1">Year</p>
                <select
                  name="year"
                  id="year"
                  className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className="basis-9/12 bg-white border-dark-red-2 border-2 rounded-lg p-10 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center mb-8">
              <p className="font-bold text-lg text-center mb-2">
                List of General Fees
              </p>
              <p className="text-center">A1 German Basic Course</p>
            </div>

            <div className="mb-8">
              <table className="w-full mb-5">
                <thead>
                  <tr className="border-b-2 border-dark-red-2">
                    <th className="py-2 font-bold w-[70%] text-start">
                      Description
                    </th>
                    <th className="py-2 font-bold w-[15%]">Amount</th>
                    <th className="py-2 font-bold w-[15%]">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(isEditMode ? editedFees : fees).map((fee, index) => (
                    <tr
                      key={fee.id}
                      className="border-b-2 border-[rgb(137,14,7,.49)]"
                    >
                      <td className="py-2 uppercase">
                        {isEditMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={fee.description}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "description",
                                  e.target.value.toUpperCase()
                                )
                              }
                              className="w-60 px-2 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2"
                            />
                            <button
                              onClick={() =>
                                handleFieldUndo(fee.id, "description")
                              }
                              className={`p-1 rounded ${
                                hasFieldChanged(fee.id, "description")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              title="Undo changes to description"
                              disabled={!hasFieldChanged(fee.id, "description")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.description
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {isEditMode ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={fee.amount}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-24 px-1.5 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2 text-center"
                            />
                            <button
                              onClick={() => handleFieldUndo(fee.id, "amount")}
                              className={`p-1 rounded ${
                                hasFieldChanged(fee.id, "amount")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              title="Undo changes to amount"
                              disabled={!hasFieldChanged(fee.id, "amount")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.amount
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {isEditMode ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={fee.dueDate}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "dueDate",
                                  e.target.value
                                )
                              }
                              className="w-28 px-1.5 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2 text-center"
                            />
                            <button
                              onClick={() => handleFieldUndo(fee.id, "dueDate")}
                              className={`p-1 rounded ${
                                hasFieldChanged(fee.id, "dueDate")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              title="Undo changes to due date"
                              disabled={!hasFieldChanged(fee.id, "dueDate")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.dueDate
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleDiscard}
                    className="bg-grey-1 rounded-md hover:bg-grey-2 focus:outline-none text-black font-semibold text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-6 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                  >
                    Save
                  </button>
                </>
              ) : (
                <div className="flex justify-end gap-3">
                  <ThinRedButton onClick={handleEditFees}>
                    Edit Fees
                  </ThinRedButton>
                  <ThinRedButton onClick={handleAddFees}>
                    Add Fees
                  </ThinRedButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddFeeModal && (
        <AddFeeModal
          isOpen={showAddFeeModal}
          onClose={handleCloseAddFeeModal}
          onAddFee={handleAddFee}
        />
      )}

      {showDiscardModal && (
        <DiscardChangesModal
          show={showDiscardModal}
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      )}

      {showSaveModal && (
        <SaveChangesModal
          show={showSaveModal}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}

      {showSaveNotifyModal && (
        <SaveNotifyModal
          show={showSaveNotifyModal}
          onClose={handleCloseSaveNotify}
        />
      )}
    </>
  );
}

export default ManageFees;
