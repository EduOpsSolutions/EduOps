import React from "react";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axios";
import Pagination from "../../components/common/Pagination";
import SearchField from "../../components/textFields/SearchField";
import DropDown from "../../components/form/DropDown";
import Swal from "sweetalert2";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    userActivity: 0,
    systemActivity: 0,
    apiResponse: 0,
    errorLog: 0,
    securityLog: 0,
  });

  const formatCell = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "user_activity":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "system_activity":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "api_response":
        return "bg-green-100 text-green-800 border border-green-200";
      case "error_log":
        return "bg-red-100 text-red-800 border border-red-200";
      case "security_log":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getModuleBadgeColor = (module) => {
    const colors = {
      AUTH: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      ENROLLMENTS: "bg-cyan-100 text-cyan-800 border border-cyan-200",
      SCHEDULES: "bg-teal-100 text-teal-800 border border-teal-200",
      GRADING: "bg-orange-100 text-orange-800 border border-orange-200",
      DOCUMENTS: "bg-pink-100 text-pink-800 border border-pink-200",
      PAYMENTS: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      REPORTS: "bg-violet-100 text-violet-800 border border-violet-200",
      CONTENTS: "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200",
      SYSTEM: "bg-slate-100 text-slate-800 border border-slate-200",
      UNCATEGORIZED: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return colors[module] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getTypeDisplay = (type) => {
    const displays = {
      user_activity: "User Activity",
      system_activity: "System Activity",
      api_response: "API Response",
      error_log: "Error Log",
      security_log: "Security Log",
    };
    return displays[type] || type;
  };

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "user_activity", label: "User Activity" },
    { value: "system_activity", label: "System Activity" },
    { value: "api_response", label: "API Response" },
    { value: "error_log", label: "Error Log" },
    { value: "security_log", label: "Security Log" },
  ];

  const moduleOptions = [
    { value: "", label: "All Modules" },
    { value: "AUTH", label: "Authentication" },
    { value: "ENROLLMENTS", label: "Enrollments" },
    { value: "SCHEDULES", label: "Schedules" },
    { value: "GRADING", label: "Grading" },
    { value: "DOCUMENTS", label: "Documents" },
    { value: "PAYMENTS", label: "Payments" },
    { value: "REPORTS", label: "Reports" },
    { value: "CONTENTS", label: "Contents" },
    { value: "SYSTEM", label: "System" },
    { value: "UNCATEGORIZED", label: "Uncategorized" },
  ];

  const handleTypeCardClick = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        // Remove the type if already selected
        return prev.filter((t) => t !== type);
      } else {
        // Add the type if not selected
        return [...prev, type];
      }
    });
    setPage(1); // Reset to first page when filter changes
  };

  const handleSearch = useCallback(() => {
    setLoading(true);

    // Build type filter from selected cards
    let typeParam = typeFilter;
    if (selectedTypes.length > 0 && !typeFilter) {
      // If cards are selected and dropdown is not used, use card selection
      typeParam = selectedTypes.join(",");
    }

    axiosInstance
      .get("/logs", {
        params: {
          page,
          limit,
          dateStart: dateStart || undefined,
          dateEnd: dateEnd || undefined,
          type: typeParam || undefined,
          moduleType: moduleFilter || undefined,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        },
      })
      .then((response) => {
        const data = response.data.data;
        if (data.length > 0) {
          setLogs(
            data.map((item) => ({
              ...item,
              // createdAt: new Date(item.createdAt).toLocaleString("en-US", {
              //   year: "numeric",
              //   month: "long",
              //   day: "numeric",
              //   hour: "2-digit",
              //   minute: "2-digit",
              //   second: "2-digit",
              // }),
              // updatedAt: new Date(item.updatedAt).toLocaleString(),
            }))
          );
        } else {
          setLogs([]);
        }
        setTotal(response.data.total);
        setTotalPages(response.data.max_page);

        // Calculate stats from current page data
        const statsCounts = {
          total: response.data.total,
          userActivity: 0,
          systemActivity: 0,
          apiResponse: 0,
          errorLog: 0,
          securityLog: 0,
        };

        data.forEach((log) => {
          switch (log.type) {
            case "user_activity":
              statsCounts.userActivity++;
              break;
            case "system_activity":
              statsCounts.systemActivity++;
              break;
            case "api_response":
              statsCounts.apiResponse++;
              break;
            case "error_log":
              statsCounts.errorLog++;
              break;
            case "security_log":
              statsCounts.securityLog++;
              break;
            default:
              break;
          }
        });

        setStats(statsCounts);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message || "Failed to load logs");
        setLoading(false);
      });
  }, [
    page,
    limit,
    dateStart,
    dateEnd,
    typeFilter,
    moduleFilter,
    selectedTypes,
  ]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const StatCard = ({
    icon,
    title,
    value,
    colorClass,
    onClick,
    isSelected,
  }) => (
    <div
      onClick={onClick}
      className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer transform hover:scale-105 ${
        isSelected
          ? "border-dark-red-2 shadow-lg ring-2 ring-dark-red-2 ring-opacity-50"
          : "border-dark-red hover:shadow-md"
      }`}
    >
      <div className="flex items-center">
        <div
          className={`bg-gradient-to-br ${colorClass} rounded-full p-2 mr-3`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-dark-red">{value}</p>
        </div>
      </div>
      {isSelected && (
        <div className="mt-2 flex justify-end">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dark-red-2 text-white">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Active
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              System Logs
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Monitor and track all system activities
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Click on cards to filter by log type (multiple selections allowed)
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
            <StatCard
              title="Total"
              value={stats.total}
              colorClass="from-blue-500 to-blue-600"
              onClick={() => {
                setSelectedTypes([]);
                setPage(1);
              }}
              isSelected={selectedTypes.length === 0}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="User Activity"
              value={stats.userActivity}
              colorClass="from-green-500 to-green-600"
              onClick={() => handleTypeCardClick("user_activity")}
              isSelected={selectedTypes.includes("user_activity")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />
            <StatCard
              title="System"
              value={stats.systemActivity}
              colorClass="from-purple-500 to-purple-600"
              onClick={() => handleTypeCardClick("system_activity")}
              isSelected={selectedTypes.includes("system_activity")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="API"
              value={stats.apiResponse}
              colorClass="from-cyan-500 to-cyan-600"
              onClick={() => handleTypeCardClick("api_response")}
              isSelected={selectedTypes.includes("api_response")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Errors"
              value={stats.errorLog}
              colorClass="from-red-500 to-red-600"
              onClick={() => handleTypeCardClick("error_log")}
              isSelected={selectedTypes.includes("error_log")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Security"
              value={stats.securityLog}
              colorClass="from-yellow-500 to-yellow-600"
              onClick={() => handleTypeCardClick("security_log")}
              isSelected={selectedTypes.includes("security_log")}
              icon={
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col gap-4">
              {/* Search and Dropdowns */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto">
                  <SearchField
                    name="search"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={handleSearch}
                    className="w-full sm:w-80"
                  />
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start w-full sm:w-auto gap-3">
                  <DropDown
                    name="type"
                    id="type"
                    options={typeOptions}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-48"
                  />
                  <DropDown
                    name="module"
                    id="module"
                    options={moduleOptions}
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 w-full sm:w-64">
                  <label
                    htmlFor="dateStart"
                    className="text-sm font-medium text-gray-700"
                  >
                    From Date
                  </label>
                  <input
                    type="date"
                    id="dateStart"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-64">
                  <label
                    htmlFor="dateEnd"
                    className="text-sm font-medium text-gray-700"
                  >
                    To Date
                  </label>
                  <input
                    type="date"
                    id="dateEnd"
                    value={dateEnd}
                    onChange={(e) => {
                      if (
                        dateStart &&
                        new Date(dateStart) > new Date(e.target.value)
                      ) {
                        Swal.fire({
                          icon: "warning",
                          title: "Invalid Date Range",
                          text: "End date must be after start date",
                          confirmButtonColor: "#992525",
                        });
                        setDateEnd("");
                        return;
                      }
                      setDateEnd(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                  <p className="text-lg">Loading Logs...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            ID
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Title
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Type
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Module
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            User ID
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Created At
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, index) => (
                          <tr
                            key={log.id || index}
                            className="cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:shadow-sm"
                            onClick={() => {
                              Swal.fire({
                                title: log.title,
                                html: `
                                  <div class="text-left">
                                    <p class="mb-2"><strong>ID:</strong> ${
                                      log.id
                                    }</p>
                                    <p class="mb-2"><strong>Type:</strong> ${getTypeDisplay(
                                      log.type
                                    )}</p>
                                    <p class="mb-2"><strong>Module:</strong> ${
                                      log.moduleType
                                    }</p>
                                    <p class="mb-2"><strong>User ID:</strong> ${
                                      log.userId || "N/A"
                                    }</p>
                                    <p class="mb-2"><strong>Created:</strong> ${formatDate(
                                      log.createdAt
                                    )}</p>
                                    ${
                                      log.content
                                        ? `<p class="mb-2"><strong>Content:</strong></p><pre class="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">${formatCell(
                                            log.content
                                          )}</pre>`
                                        : ""
                                    }
                                    ${
                                      log.reqBody
                                        ? `<p class="mb-2"><strong>Request Body:</strong></p><pre class="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">${formatCell(
                                            log.reqBody
                                          )}</pre>`
                                        : ""
                                    }
                                  </div>
                                `,
                                confirmButtonColor: "#992525",
                                width: "800px",
                              });
                            }}
                          >
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <span className="font-mono text-gray-600">
                                #{log.id}
                              </span>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="max-w-xs truncate"
                                title={log.title}
                              >
                                {log.title}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                                  log.type
                                )}`}
                              >
                                {getTypeDisplay(log.type)}
                              </span>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getModuleBadgeColor(
                                  log.moduleType
                                )}`}
                              >
                                {log.moduleType}
                              </span>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <span className="font-mono text-gray-600 text-xs">
                                {log.userId || "N/A"}
                              </span>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              {formatDate(log.createdAt)}
                            </td>
                          </tr>
                        ))}
                        {(!logs || logs.length === 0) && !loading && (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                            >
                              No logs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!loading && logs.length > 0 && (
                  <div className="mt-4">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
