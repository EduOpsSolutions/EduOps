import React, { useState, useEffect, useMemo } from 'react';
import SearchForm from '../../components/common/SearchFormHorizontal';
import axiosInstance from '../../utils/axios';
import Spinner from '../../components/common/Spinner';
import useAuthStore from '../../stores/authStore';

function StudyLoad() {
  const [searchParams, setSearchParams] = useState({ batch: '', year: '' });
  const [periods, setPeriods] = useState([]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const { user } = useAuthStore();

  // Load all academic periods to derive year and batch options
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await axiosInstance.get('/academic-periods');
        const data = Array.isArray(resp.data) ? resp.data : [];
        if (!mounted) return;
        setPeriods(data.filter((p) => !p.deletedAt));
        // Default year: current year if exists in periodName, else latest distinct periodName
        const distinctYears = [
          ...new Set(data.map((p) => p.periodName)),
        ].filter(Boolean);
        const currentYear = String(new Date().getFullYear());
        const defaultYear = distinctYears.includes(currentYear)
          ? currentYear
          : distinctYears.sort().slice(-1)[0] || '';
        setSearchParams((prev) => ({ ...prev, year: defaultYear }));
      } catch (e) {
        setPeriods([]);
      } finally {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const yearOptions = useMemo(() => {
    const years = [...new Set(periods.map((p) => p.periodName))].filter(
      Boolean
    );
    const opts = years.sort().map((y) => ({ value: y, label: y }));
    return [{ value: '', label: '-- Select Year --' }, ...opts];
  }, [periods]);

  const batchOptions = useMemo(() => {
    if (!searchParams.year) return [];
    const batches = periods
      .filter((p) => p.periodName === searchParams.year)
      .map((p) => p.batchName)
      .filter(Boolean);
    const uniq = [...new Set(batches)];
    const opts = uniq.sort().map((b) => ({ value: b, label: b }));
    return [{ value: '', label: '-- Select Batch --' }, ...opts];
  }, [periods, searchParams.year]);

  const searchLogic = {
    searchParams,
    handleInputChange: (e) => {
      const { name, value } = e.target;
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'year' ? { batch: '' } : {}),
      }));
    },
  };

  const searchFields = {
    title: 'SELECT SCHOOL PERIOD',
    formFields: [
      {
        name: 'year',
        label: 'Academic Period',
        type: 'select',
        options: yearOptions,
      },
      { name: 'batch', label: 'Batch', type: 'select', options: batchOptions },
    ],
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setResults([]);
      setSelectedPeriod(null);
      if (!searchParams.year || !searchParams.batch) return;
      const period = periods.find(
        (p) =>
          p.periodName === searchParams.year &&
          p.batchName === searchParams.batch
      );
      if (!period) {
        setResults([]);
        setSelectedPeriod(null);
        return;
      }
      setSelectedPeriod(period);
      // Fetch student schedules and filter by selected period
      const resp = await axiosInstance.get('/schedules/mine');
      const all = Array.isArray(resp.data) ? resp.data : [];
      const inPeriod = all.filter(
        (e) =>
          e.academicPeriodId === period.id ||
          (e.academicPeriodName &&
            e.academicPeriodName.startsWith(period.periodName) &&
            e.academicPeriodName.includes(searchParams.batch))
      );
      setResults(inPeriod);
    } finally {
      setSearching(false);
    }
  };

  // Auto-select first available batch when year changes and batch is empty
  useEffect(() => {
    if (!searchParams.year) return;
    const nonPlaceholder = batchOptions.filter((o) => o.value);
    if (!searchParams.batch && nonPlaceholder.length > 0) {
      setSearchParams((prev) => ({ ...prev, batch: nonPlaceholder[0].value }));
    }
  }, [searchParams.year, searchParams.batch, batchOptions]);

  const renderBody = () => {
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
          Select a year and batch, then click Search to view your study load.
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
      <table className="w-full table-fixed">
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
    );
  };

  return (
    <div className="bg-white-yellow-tone w-full box-border flex flex-col px-4 sm:px-8 md:px-12 lg:px-20 overflow-x-hidden">
      <div className="w-full max-w-screen-xl mx-auto mt-8 mb-8">
        <SearchForm
          searchLogic={searchLogic}
          fields={searchFields}
          onSearch={handleSearch}
        />

        <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5">
          <div className="flex flex-row gap-7 items-center pb-4 border-b-2 border-dark-red-2">
            <p className="text-xl uppercase grow">
              {user?.lastName
                ? `${user.lastName}, ${user.firstName}`
                : 'Your Study Load'}
            </p>
            {selectedPeriod && (
              <p className="text-sm text-gray-600">
                {selectedPeriod.periodName} - {selectedPeriod.batchName}
              </p>
            )}
          </div>
          <table className="w-full table-fixed">
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
        </div>
      </div>
    </div>
  );
}

export default StudyLoad;
