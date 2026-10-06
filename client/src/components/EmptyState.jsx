const EmptyState = ({ icon = '🍽️', title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-stone-800 mb-2">{title}</h3>
    {message && <p className="text-stone-500 max-w-md mb-6">{message}</p>}
    {action && (
      <div>{action}</div>
    )}
  </div>
);

export default EmptyState;
