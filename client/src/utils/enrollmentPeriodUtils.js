import axiosInstance from "./axios";

/**
 * Check if there are any ongoing enrollment periods
 * @returns {Promise<{hasOngoingPeriod: boolean, currentPeriod: object|null, error: string|null}>}
 */
export const checkOngoingEnrollmentPeriod = async () => {
  try {
    const response = await axiosInstance.get("/academic-periods");
    const now = new Date();

    // Find ongoing periods
    const ongoingPeriods = response.data.filter((period) => {
      if (period.status === "ended" || period.deletedAt) return false;

      const startDate = new Date(period.startAt);
      const endDate = new Date(period.endAt);
      return now >= startDate && now <= endDate;
    });

    const hasOngoingPeriod = ongoingPeriods.length > 0;
    const currentPeriod = hasOngoingPeriod ? ongoingPeriods[0] : null;

    return {
      hasOngoingPeriod,
      currentPeriod,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch enrollment periods:", error);
    return {
      hasOngoingPeriod: false,
      currentPeriod: null,
      error: "Failed to check enrollment availability",
    };
  }
};

/**
 * Format enrollment period date range for display
 * @param {object} period - The enrollment period object
 * @returns {string} - Formatted date range
 */
export const formatEnrollmentPeriodDates = (period) => {
  if (!period) return "";

  const startDate = new Date(period.startAt);
  const endDate = new Date(period.endAt);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return `${startDate.toLocaleDateString(
    "en-US",
    options
  )} - ${endDate.toLocaleDateString("en-US", options)}`;
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

  let status, bgColor, textColor, borderColor;

  if (period.status === "ended") {
    status = "Ended";
    bgColor = "bg-red-100";
    textColor = "text-red-800";
    borderColor = "border-red-200";
  } else if (now < startDate) {
    status = "Upcoming";
    bgColor = "bg-blue-100";
    textColor = "text-blue-800";
    borderColor = "border-blue-200";
  } else if (now >= startDate && now <= endDate) {
    status = "Ongoing";
    bgColor = "bg-green-100";
    textColor = "text-green-800";
    borderColor = "border-green-200";
  } else {
    status = "Ended";
    bgColor = "bg-red-100";
    textColor = "text-red-800";
    borderColor = "border-red-200";
  }

  return {
    status,
    bgColor,
    textColor,
    borderColor,
    isActive: status === "Ongoing",
  };
};
