export const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizes[size]} border-primary-600 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
