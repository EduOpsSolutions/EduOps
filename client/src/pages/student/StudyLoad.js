import React, { useState, useEffect, useMemo } from 'react';
import SearchForm from '../../components/common/SearchFormHorizontal';
import axiosInstance from '../../utils/axios';
import Spinner from '../../components/common/Spinner';
import useAuthStore from '../../stores/authStore';
import logo from '../../assets/images/SprachinsLogo.png';

function StudyLoad() {
  const [searchParams, setSearchParams] = useState({ batch: '' });
  const [periods, setPeriods] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const { user } = useAuthStore();

  // Load all academic periods and current student schedules
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        // Load academic periods
        const periodsResp = await axiosInstance.get('/academic-periods');
        const periodsData = Array.isArray(periodsResp.data) ? periodsResp.data : [];
        if (!mounted) return;
        setPeriods(periodsData.filter((p) => !p.deletedAt));

        // Load current student schedules to determine current batch
        const schedulesResp = await axiosInstance.get('/schedules/mine');
        const schedulesData = Array.isArray(schedulesResp.data) ? schedulesResp.data : [];
        
        if (schedulesData.length > 0) {
          // Get the most recent academic period from schedules
          const currentPeriodId = schedulesData[0].academicPeriodId;
          const currentPeriod = periodsData.find(p => p.id === currentPeriodId);
          
          if (currentPeriod) {
            setSearchParams(prev => ({ ...prev, batch: currentPeriod.batchName }));
            setSelectedPeriod(currentPeriod);
            // Only show courses for the current batch
            const currentBatchSchedules = schedulesData.filter(schedule => 
              schedule.academicPeriodId === currentPeriodId
            );
            setResults(currentBatchSchedules);
          }
        }
      } catch (e) {
        console.error('Error loading data:', e);
        setPeriods([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const batchOptions = useMemo(() => {
    const batches = periods.map((p) => p.batchName).filter(Boolean);
    const uniq = [...new Set(batches)];
    const opts = uniq.sort().map((b) => ({ value: b, label: b }));
    return [{ value: '', label: '-- Select Batch --' }, ...opts];
  }, [periods]);

  const searchLogic = {
    searchParams,
    handleInputChange: (e) => {
      const { name, value } = e.target;
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
  };

  const searchFields = {
    title: 'SELECT BATCH',
    formFields: [
      { name: 'batch', label: 'Batch', type: 'select', options: batchOptions },
    ],
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setResults([]);
      setSelectedPeriod(null);
      if (!searchParams.batch) return;
      const period = periods.find((p) => p.batchName === searchParams.batch);
      if (!period) {
        setResults([]);
        setSelectedPeriod(null);
        return;
      }
      setSelectedPeriod(period);
      // Fetch student schedules and filter by selected period
      const resp = await axiosInstance.get('/schedules/mine');
      const all = Array.isArray(resp.data) ? resp.data : [];
      const inPeriod = all.filter((e) => e.academicPeriodId === period.id);
      setResults(inPeriod);
    } finally {
      setSearching(false);
    }
  };

  // Calculate total hours for all schedules
  const calculateTotalHoursSum = () => {
    let total = 0;
    results.forEach((ev) => {
      const calculateTotalHours = (ev) => {
        try {
          if (
            !ev?.periodStart ||
            !ev?.periodEnd ||
            !ev?.time_start ||
            !ev?.time_end ||
            !ev?.days
          ) {
            return null;
          }
          const [sh, sm] = String(ev.time_start).split(':').map(Number);
          const [eh, em] = String(ev.time_end).split(':').map(Number);
          const minutes = eh * 60 + em - (sh * 60 + sm);
          if (minutes <= 0) return null;
          const hoursPerSession = minutes / 60;

          const dayMap = { SU: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, S: 6 };
          const selectedDays = new Set(
            String(ev.days)
              .split(',')
              .map((d) => d.trim())
              .filter(Boolean)
              .map((d) => dayMap[d])
              .filter((n) => n !== undefined)
          );
          if (selectedDays.size === 0) return null;

          const start = new Date(ev.periodStart);
          const end = new Date(ev.periodEnd);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
            return null;
          if (start > end) return null;

          let count = 0;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (selectedDays.has(d.getDay())) count++;
          }

          const totalHours = count * hoursPerSession;
          return totalHours;
        } catch (_) {
          return null;
        }
      };

      const hours = calculateTotalHours(ev);
      if (hours !== null) {
        total += hours;
      }
    });
    const fixed = total.toFixed(1);
    return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
  };

  // Export as PDF (using browser print)
  const handleExportPdf = () => {
    if (results.length === 0 || !selectedPeriod) {
      alert('Please select a batch with schedules to export.');
      return;
    }
    window.print();
  };


  const renderBody = () => {
    if (loading) {
      return (
        <div className="py-8">
          <Spinner size="lg" color="text-dark-red-2" message="Loading your study load..." />
        </div>
      );
    }
    if (searching) {
      return (
        <div className="py-8">
          <Spinner size="lg" color="text-dark-red-2" message="Searching..." />
        </div>
      );
    }
    if (!selectedPeriod) {
      return (
        <div className="py-6 text-sm text-gray-600">
          Select a batch to view your study load.
        </div>
      );
    }
    if (results.length === 0) {
      return (
        <div className="py-6 text-sm text-gray-700">
          Not enrolled in this batch.
        </div>
      );
    }
    // Helper: compute total hours between start/end dates based on selected days
    const calculateTotalHours = (ev) => {
      try {
        if (
          !ev?.periodStart ||
          !ev?.periodEnd ||
          !ev?.time_start ||
          !ev?.time_end ||
          !ev?.days
        ) {
          return null;
        }
        // Parse time duration in hours
        const [sh, sm] = String(ev.time_start).split(':').map(Number);
        const [eh, em] = String(ev.time_end).split(':').map(Number);
        const minutes = eh * 60 + em - (sh * 60 + sm);
        if (minutes <= 0) return null;
        const hoursPerSession = minutes / 60;

        // Map day codes to JS day indexes (0=Sun ... 6=Sat)
        const dayMap = { SU: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, S: 6 };
        const selectedDays = new Set(
          String(ev.days)
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)
            .map((d) => dayMap[d])
            .filter((n) => n !== undefined)
        );
        if (selectedDays.size === 0) return null;

        // Count matching days between start and end (inclusive)
        const start = new Date(ev.periodStart);
        const end = new Date(ev.periodEnd);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
          return null;
        if (start > end) return null;

        let count = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (selectedDays.has(d.getDay())) count++;
        }

        const total = count * hoursPerSession;
        // Return with one decimal precision, trimming trailing .0
        const fixed = total.toFixed(1);
        return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
      } catch (_) {
        return null;
      }
    };

    return (
      <>
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 mt-4">
          {results.map((ev) => (
            <div
              key={ev.id}
              className="border border-dark-red-2 rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="mb-3 pb-3 border-b border-dark-red-2 border-opacity-30">
                <div className="text-base font-semibold text-dark-red">
                  {ev.courseName || '—'}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium text-right">
                    <div>{ev.days || '—'}</div>
                    <div>
                      {ev.time_start || '—'}
                      {ev.time_end ? ` - ${ev.time_end}` : ''}
                    </div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adviser:</span>
                  <span className="font-medium">{ev.teacherName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600"># of Hours:</span>
                  <span className="font-semibold text-dark-red">
                    {calculateTotalHours(ev) ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{ev.location || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <table className="hidden md:table w-full table-fixed">
          <tbody>
            {results.map((ev) => (
              <tr
                key={ev.id}
                className="border-b border-dark-red-2 border-b-opacity-50"
              >
                <td className="py-3 text-center"> {ev.courseName || '—'} </td>
                <td className="py-3 text-center">
                  <p>{ev.days || '—'}</p>
                  <p>
                    {ev.time_start || '—'}
                    {ev.time_end ? ` - ${ev.time_end}` : ''}
                  </p>
                </td>
                <td className="py-3 text-center"> {ev.teacherName || '—'} </td>
                <td className="py-3 text-center">
                  {' '}
                  {calculateTotalHours(ev) ?? '—'}{' '}
                </td>
                <td className="py-3 text-center"> {ev.location || '—'} </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="bg_custom bg-white-yellow-tone min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #de0000;
            padding-bottom: 20px;
          }
          .print-header .logo {
            width: 200px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .print-header h1 {
            font-size: 28px;
            color: #de0000;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .print-header h2 {
            font-size: 18px;
            color: #666;
            font-weight: normal;
          }
          .print-student-info {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #de0000;
          }
          .print-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .print-total {
            text-align: right;
            margin-top: 20px;
            padding: 15px;
            background: #fffdf2;
            border: 2px solid #ffd700;
            font-size: 16px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead {
            background: #de0000 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          th {
            padding: 12px;
            font-weight: bold;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 no-print">
          <SearchForm
            searchLogic={searchLogic}
            fields={searchFields}
            onSearch={handleSearch}
          />
        </div>

        <div id="printable-area" className="bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8">
          <div className="print-header" style={{ display: 'none' }}>
            <img src={logo} alt="Sprachins Logo" className="logo" />
            <h1>Study Load</h1>
            <h2>Academic Schedule Report</h2>
          </div>
          <div className="pb-4 border-b-2 border-dark-red-2 mb-4">
            <div className="flex flex-col md:flex-row md:gap-7 md:items-center">
              <div className="grow">
                <p className="text-xl uppercase">
                  {user?.lastName
                    ? `${user.lastName}, ${user.firstName}`
                    : 'Your Study Load'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Student ID: {user?.userId || user?.id || 'N/A'}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                {selectedPeriod && (
                  <p className="text-sm text-gray-600">
                    {selectedPeriod.batchName}
                  </p>
                )}
                {results.length > 0 && selectedPeriod && (
                  <button
                    onClick={handleExportPdf}
                    className="no-print flex items-center gap-2 bg-dark-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Export PDF
                  </button>
                )}
              </div>
            </div>
            {/* Mobile: Batch and Export button on separate row */}
            {results.length > 0 && selectedPeriod && (
              <div className="md:hidden mt-3 flex flex-col gap-2">
                {selectedPeriod && (
                  <p className="text-sm text-gray-600">
                    {selectedPeriod.batchName}
                  </p>
                )}
                <button
                  onClick={handleExportPdf}
                  className="no-print w-full flex items-center justify-center gap-2 bg-dark-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Export PDF
                </button>
              </div>
            )}
          </div>
          <table className="hidden md:table w-full table-fixed">
            <thead>
              <tr className="border-b border-dark-red-2 border-opacity-50">
                <th className="py-3 font-bold"> Course </th>
                <th className="py-3 font-bold"> Schedule </th>
                <th className="py-3 font-bold"> Adviser </th>
                <th className="py-3 font-bold"> # of Hours </th>
                <th className="py-3 font-bold"> Room </th>
              </tr>
            </thead>
          </table>
          {renderBody()}

          {/* Total Hours and Footer */}
          {results.length > 0 && selectedPeriod && (
            <>
              <div className="mt-6 text-right">
                <div className="inline-block bg-yellow-50 border-2 border-yellow-300 rounded-lg px-6 py-3">
                  <span className="text-lg font-semibold text-gray-700 mr-3">
                    Total Hours:
                  </span>
                  <span className="text-xl font-bold text-dark-red">
                    {calculateTotalHoursSum()}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                <p className="italic">
                  Printed at: {new Date().toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyLoad;
