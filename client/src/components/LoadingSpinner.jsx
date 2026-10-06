const LoadingSpinner = ({ size = 'md', fullPage = false, text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-stone-200 border-t-amber-600 rounded-full animate-spin`} />
      {text && <p className="text-stone-500 text-sm">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
