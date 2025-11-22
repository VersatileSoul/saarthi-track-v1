// Helper  utility functions

/**
 * Format error message for API response
 */
const formatError = (message, statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode,
  };
};

/**
 * Format success response
 */
const formatSuccess = (data, message = "Success", statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

/**
 * Generate random string
 */
const generateRandomString = (Length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, Length + 2);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Calculate duration between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date (optional, defaults to now)
 * @param {String} Formatted duration (e.g., "2h 30m" or "1d 5h 20m")
 */
const calculateDuration = (startDate, endDate = new Date()) => {
  if (!startDate) return "N/A";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;

  if (diff < 0) return "0m";

  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const hours = diffHours % 24;
  const minutes = diffMinutes % 60;

  const parts = [];
  if (diffDays > 0) parts.push(`${diffDays}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

module.exports = {
  formatError,
  formatSuccess,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  calculateDuration,
};
