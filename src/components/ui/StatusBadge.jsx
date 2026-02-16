import { getStatusColor, getStatusLabel } from '../../utils/formatters';

export const StatusBadge = ({ status, lastUpdatedAt }) => {
  const color = getStatusColor(status, lastUpdatedAt);
  const label = getStatusLabel(status, lastUpdatedAt);

  const colorStyles = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colorStyles[color]}`}>
      {label}
    </span>
  );
};
