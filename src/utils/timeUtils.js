/**
 * Format a date to a relative time string (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  
  // If less than a minute ago
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  // If less than an hour ago
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  // If less than a day ago
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  // If less than 2 days ago (yesterday)
  if (diffInHours < 48) {
    return 'yesterday';
  }
  
  // If less than a week ago
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  // If less than a month ago
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  
  // If less than a year ago
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  // More than a year ago
  const years = Math.floor(diffInDays / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Format a date to a detailed string with date and time
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDetailedDate = (date) => {
  const postDate = new Date(date);
  return postDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};