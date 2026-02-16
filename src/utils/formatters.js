import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return date;
  }
};

export const formatDateInput = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

export const getStatusColor = (status, lastUpdatedAt) => {
  if (status === 'submitted') return 'green';
  if (status === 'locked') return 'gray';

  if (!lastUpdatedAt) return 'red';

  try {
    const date = lastUpdatedAt.toDate ? lastUpdatedAt.toDate() : new Date(lastUpdatedAt);
    const hoursSinceUpdate = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) return 'blue';
    if (hoursSinceUpdate < 48) return 'yellow';
    return 'red';
  } catch (error) {
    return 'red';
  }
};

export const getStatusLabel = (status, lastUpdatedAt) => {
  if (status === 'submitted') return 'Submitted';
  if (status === 'locked') return 'Locked';

  if (!lastUpdatedAt) return 'No data';

  try {
    const date = lastUpdatedAt.toDate ? lastUpdatedAt.toDate() : new Date(lastUpdatedAt);
    const hoursSinceUpdate = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) return 'Updated today';
    if (hoursSinceUpdate < 48) return 'Updated yesterday';
    return 'Stale data';
  } catch (error) {
    return 'Unknown';
  }
};
