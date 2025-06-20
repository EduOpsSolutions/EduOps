import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import TransactionHistoryModal from "../../components/modals/common/TransactionHistoryModal";
import AddFeesModal from "../../components/modals/transactions/AddFeesModal";

function Assessment() {
  const [transaction_history_modal, setTransactionHistoryModal] =
    useState(false);
  const [addFeesModal, setAddFeesModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white-yellow-tone h-full flex flex-col py-16 px-20">
      <div className="flex flex-row gap-16">
        <div className="h-fit grow-0 basis-3/12 bg-white border-dark-red-2 border-2 rounded-lg p-7 shadow-[0_4px_3px_0_rgba(0,0,0,0.5)]">
          <form className="flex flex-col gap-7">
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
              <p className="mb-1">Name</p>
              <input
                type="text"
                placeholder="Student Name"
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black p-2"
              />
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
          <p className="font-bold text-lg text-center mb-5">
            Tuition Fee Assessment
          </p>
          <p className="font-bold text-lg text-center mb-5">
            A1: Batch 1 | 2024
          </p>
          <div className="flex flex-row items-end pb-3 border-b-2 border-dark-red-2">
            <p className="uppercase grow">DOLOR, POLANO I.</p>
            <div className="m-0">
              <ThinRedButton
                onClick={() => {
                  setTransactionHistoryModal(true);
                }}
              >
                Transaction History
              </ThinRedButton>
              <span className="mx-2"></span>
              <ThinRedButton onClick={() => navigate("/admin/ledger")}>
                Ledger
              </ThinRedButton>
            </div>
          </div>
          <p className="font-bold text-lg text-center mt-9 mb-1">FEES</p>
          <table className="w-full mb-5">
            <thead>
              <tr className="border-b-2 border-dark-red-2">
                <th className="py-2 font-bold w-[70%] text-start">
                  Description
                </th>
                <th className="py-2 font-bold w-[15%]">Amount</th>
                <th className="py-2 font-bold w-[15%]">Due date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-2 border-[rgb(137,14,7,.49)]">
                <td className="uppercase py-2">COURSE FEE</td>
                <td className="py-2 text-center">25,850.00</td>
                <td className="py-2 text-center">May 30, 2024</td>
              </tr>
              <tr className="border-b-2 border-[rgb(137,14,7,.49)]">
                <td className="uppercase py-2">BOOKS</td>
                <td className="py-2 text-center">2,800.00</td>
                <td className="py-2 text-center">May 30, 2024</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-5">
            <button
              onClick={() => setAddFeesModal(true)}
              type="button"
              className="text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-md px-8 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
            >
              Add Fees
            </button>
          </div>

          <div className="w-full pt-3 border-t-2 border-dark-red-2 grid grid-rows-4 grid-flow-col gap-3">
            <div className="grid grid-rows-subgrid row-span-2">
              <p className="row-start-2 font-bold">Net Assessment</p>
            </div>
            <p className="font-bold">Total Payments</p>
            <p className="font-bold">Remaining Balance</p>
            <p className="font-bold text-center">Amount</p>
            <p className="text-center">28,650.00</p>
            <p className="text-center">0</p>
            <p className="text-center">28,650.00</p>
          </div>
        </div>
      </div>

      <TransactionHistoryModal
        transaction_history_modal={transaction_history_modal}
        setTransactionHistoryModal={setTransactionHistoryModal}
      />

      <AddFeesModal
        isOpen={addFeesModal}
        onClose={() => setAddFeesModal(false)}
        studentName="DOLOR, POLANO I."
        course="A1"
      />
    </div>
  );
}

export default Assessment;
