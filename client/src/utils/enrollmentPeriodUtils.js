import axiosInstance from './axios';

/**
 * Check if there are any ongoing enrollment periods
 * @returns {Promise<{hasOngoingPeriod: boolean, currentPeriod: object|null, error: string|null}>}
 */
export const checkOngoingEnrollmentPeriod = async () => {
  try {
    const response = await axiosInstance.get('/academic-periods');
    const now = new Date();

    // Only consider periods where isEnrollmentClosed is false
    const ongoingPeriods = response.data.filter((period) => {
      if (period.isEnrollmentClosed || period.deletedAt) return false;
      if (!period.enrollmentOpenAt || !period.enrollmentCloseAt) return false;
      const openDate = new Date(period.enrollmentOpenAt);
      const closeDate = new Date(period.enrollmentCloseAt);
      if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) return false;
      return now >= openDate && now <= closeDate;
    });

    const hasOngoingPeriod = ongoingPeriods.length > 0;
    const currentPeriod = hasOngoingPeriod ? ongoingPeriods[0] : null;

    return {
      hasOngoingPeriod,
      currentPeriod,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch enrollment periods:', error);
    return {
      hasOngoingPeriod: false,
      currentPeriod: null,
      error: 'Failed to check enrollment availability',
    };
  }
};

/**
 * Format enrollment period date range for display
 * @param {object} period - The enrollment period object
 * @returns {string} - Formatted date range
 */
export const formatEnrollmentPeriodDates = (period) => {
  if (!period) return '';

  const startDate = new Date(period.startAt);
  const endDate = new Date(period.endAt);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return `${startDate.toLocaleDateString(
    'en-US',
    options
  )} - ${endDate.toLocaleDateString('en-US', options)}`;
};

/**
 * Get enrollment period status with color coding information
 * @param {object} period - The enrollment period object
 * @returns {object} - Status information with styling
 */
export const getEnrollmentPeriodStatus = (period) => {
  if (!period) return null;

  const now = new Date();
  const startDate = new Date(period.startAt);
  const endDate = new Date(period.endAt);

  // Calculate actual period status based on dates
  let periodStatus;
  if (now < startDate) {
    periodStatus = 'Upcoming';
  } else if (now >= startDate && now <= endDate) {
    periodStatus = 'Ongoing';
  } else {
    periodStatus = 'Ended';
  }

  // Determine enrollment status (database status field)
  const enrollmentOpen =
    period.status === 'ongoing' || period.status === 'upcoming';

  // Display status combines both period and enrollment info
  let status, bgColor, textColor, borderColor;

  if (periodStatus === 'Ended') {
    status = 'Ended';
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    borderColor = 'border-red-200';
  } else if (periodStatus === 'Ongoing') {
    if (enrollmentOpen) {
      status = 'Ongoing';
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      borderColor = 'border-green-200';
    } else {
      status = 'Ongoing (Enrollment Closed)';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-200';
    }
  } else {
    // Upcoming
    if (enrollmentOpen) {
      status = 'Upcoming';
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-200';
    } else {
      status = 'Upcoming (Enrollment Closed)';
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      borderColor = 'border-orange-200';
    }
  }

  return {
    status,
    bgColor,
    textColor,
    borderColor,
    isActive: periodStatus === 'Ongoing',
    periodStatus, // The actual period status
    enrollmentOpen, // Whether enrollment is open
  };
};
