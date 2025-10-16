import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BsDownload,
  BsArrowLeft,
  BsFileEarmarkText,
  BsCalendar,
  BsFileEarmarkBarGraph,
  BsFileEarmarkSpreadsheet,
} from 'react-icons/bs';

function ReportSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    // Get report data from location state
    if (location.state?.reportData && location.state?.selectedReport) {
      setReportData(location.state.reportData);
      setSelectedReport(location.state.selectedReport);
    } else {
      // If no data, redirect back to reports page
      navigate('/admin/reports');
    }
  }, [location.state, navigate]);

  const handleDownloadReport = () => {
    if (!reportData || !selectedReport) return;

    // Convert report data to JSON and download
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport.name.replace(
      /\s+/g,
      '_'
    )}_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;

    try {
      // Convert JSON data to CSV format
      const data = reportData.data;

      // Get all unique keys from all data objects for CSV headers
      const allKeys = new Set();
      data.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key));
      });
      const headers = Array.from(allKeys);

      // Helper function to flatten nested objects/arrays for CSV
      const flattenValue = (value) => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) {
          // Handle array of objects
          if (value.length > 0 && typeof value[0] === 'object') {
            return value
              .map((item) => Object.values(item).join(': '))
              .join('; ');
          }
          // Handle simple arrays
          return value.join('; ');
        }
        if (typeof value === 'object') {
          return Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
        }
        return String(value);
      };

      // Create CSV header row
      const csvHeaders = headers.map((h) => `"${h}"`).join(',');

      // Create CSV data rows
      const csvRows = data.map((row) => {
        return headers
          .map((header) => {
            const value = flattenValue(row[header]);
            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      // Combine header and rows
      const csv = [csvHeaders, ...csvRows].join('\n');

      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${selectedReport.name.replace(/\s+/g, '_')}_${
          new Date().toISOString().split('.')[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV file. Please try again.');
    }
  };

  const renderTableData = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    // Check if AI-generated columns are provided
    const hasCustomColumns =
      reportData.columns &&
      Array.isArray(reportData.columns) &&
      reportData.columns.length > 0;

    let headers = [];
    let columnMap = {};

    if (hasCustomColumns) {
      // Use AI-defined columns
      headers = reportData.columns.map((col) => col.field);
      columnMap = reportData.columns.reduce((acc, col) => {
        acc[col.field] = col;
        return acc;
      }, {});
    } else {
      // Get all unique keys from all data objects (default behavior)
      const allKeys = new Set();
      reportData.data.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key));
      });
      headers = Array.from(allKeys);
    }

    const renderHeader = (header) => {
      if (hasCustomColumns && columnMap[header]) {
        return columnMap[header].header;
      }
      return header
        .replace(/([A-Z])/g, ' $1')
        .replace(/([0-9])/g, '$1')
        .trim();
    };

    const renderFormattedCell = (value, columnType) => {
      if (value === null || value === undefined) {
        return <span className="text-gray-400">-</span>;
      }

      switch (columnType) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value);
        case 'percentage':
          // If already formatted with %, return as is, otherwise format
          if (typeof value === 'string' && value.includes('%')) {
            return value;
          }
          return `${value}%`;
        case 'number':
          return new Intl.NumberFormat('en-US').format(value);
        case 'date':
          try {
            return new Date(value).toLocaleDateString();
          } catch (e) {
            return String(value);
          }
        case 'text':
        default:
          return renderCellValue(value);
      }
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {renderHeader(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.data.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {headers.map((header) => {
                  const columnType =
                    hasCustomColumns && columnMap[header]
                      ? columnMap[header].type
                      : 'text';
                  return (
                    <td
                      key={header}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {renderFormattedCell(row[header], columnType)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNestedTable = (data, depth = 0) => {
    // If it's an array of objects, render as a table
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0]);
      return (
        <div className={`${depth > 0 ? 'ml-4 my-2' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {renderCellValue(row[header], depth + 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // If it's an object, render as a key-value table
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return (
        <div className={`${depth > 0 ? 'ml-4 my-2' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {renderCellValue(value, depth + 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // If it's an array of primitives
    if (Array.isArray(data)) {
      return (
        <div className="flex flex-col gap-1">
          {data.map((item, index) => (
            <div key={index} className="text-sm">
              • {renderCellValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    return String(data);
  };

  const renderCellValue = (value, depth = 0) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    // Check if it's a nested object or array
    if (typeof value === 'object') {
      // Limit nesting depth to prevent excessive nesting
      if (depth > 3) {
        return (
          <pre className="text-xs max-w-xs overflow-auto bg-gray-50 dark:bg-gray-900 p-2 rounded">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      }
      return renderNestedTable(value, depth);
    }

    if (typeof value === 'boolean') {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    // Check if value looks like a date
    if (
      typeof value === 'string' &&
      (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))
    ) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      } catch (e) {
        // Not a valid date, return as is
      }
    }

    return String(value);
  };

  if (!reportData || !selectedReport) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/reports')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <BsArrowLeft />
            Back to Reports
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${selectedReport.color}`}>
                  <BsFileEarmarkBarGraph className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {reportData.reportName}
                  </h1>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReport.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <BsFileEarmarkSpreadsheet />
                  Download CSV
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <BsDownload />
                  Download JSON
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BsCalendar />
                <span>
                  Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BsFileEarmarkText />
                <span>Total Records: {reportData.totalRecords}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {reportData.summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .toUpperCase()
                      .trim()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Report Data
            </h2>
          </div>
          <div className="overflow-x-auto">{renderTableData()}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportSummary;
