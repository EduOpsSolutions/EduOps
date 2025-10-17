import React from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import Pagination from "../../components/common/Pagination";
import Swal from "sweetalert2";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentTotalPages, setCurrentTotalPages] = useState(0);
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/logs", {
        params: {
          page,
          limit,
          dateStart,
          dateEnd,
        },
      })
      .then((data) => {
        setLogs(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
        setCurrentLimit(data.limit);
        setCurrentTotal(data.count);
        setCurrentTotalPages(data.max_page);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const formatCell = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const handleSearch = () => {
    setLoading(true);
    axiosInstance
      .get("/logs", {
        params: {
          page,
          limit,
          dateStart,
          dateEnd,
        },
      })
      .then((data) => {
        setLogs(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
        setCurrentLimit(data.limit);
        setCurrentTotal(data.count);
        setCurrentTotalPages(data.max_page);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleSearch();
  }, [page, limit, dateStart, dateEnd]);

  return (
    <div className="flex flex-col gap-4  md:w-[90vw] w-[95vw] mx-auto">
      <h1>Logs</h1>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      <div className="flex flex-row gap-4 w-[90%] mx-auto">
        <div className="flex flex-col gap-2 w-1/4">
          <label htmlFor="dateStart">Date Start</label>
          <input
            type="date"
            id="dateStart"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="dateEnd">Date End</label>
          <input
            type="date"
            id="dateEnd"
            value={dateEnd}
            onChange={(e) => {
              if (dateStart && new Date(dateStart) > new Date(e.target.value)) {
                Swal.fire({
                  icon: "warning",
                  title: "Date Start must be before Date End",
                  confirmButtonColor: "#992525",
                  cancelButtonColor: "#6b7280",
                });
                setDateEnd(null);
                return;
              }
              setDateEnd(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4 w-[90%] mx-auto">
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-lg bg-dark-red text-white text-sm font-medium hover:bg-dark-red-2 disabled:opacity-50 w-1/4"
        >
          Search
        </button>
      </div>
      {logs && logs.data && logs.data.length > 0 && (
        <div className="overflow-x-auto mx-auto mt-4 overflow-y-auto w-[90%]">
          <table className=" w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from(
                  new Set(
                    logs.data.flatMap((item) =>
                      item && typeof item === "object" ? Object.keys(item) : []
                    )
                  )
                ).map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 sticky text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.data.map((row, idx) => {
                const headers = Array.from(
                  new Set(
                    logs.data.flatMap((item) =>
                      item && typeof item === "object" ? Object.keys(item) : []
                    )
                  )
                );
                return (
                  <tr key={row.id || idx} className="hover:bg-gray-50">
                    {headers.map((header) => (
                      <td
                        key={header}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {formatCell(row ? row[header] : undefined)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => setPage(page)}
            itemsPerPage={limit}
            onItemsPerPageChange={(limit) => setLimit(limit)}
            totalItems={total}
            itemName="logs"
            showItemsPerPageSelector={true}
          />
        </div>
      )}
    </div>
  );
}
