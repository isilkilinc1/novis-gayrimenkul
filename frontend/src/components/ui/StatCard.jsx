function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-novis-bronze/20 bg-white p-4 sm:p-6 shadow-xs">
      <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{title}</p>
      <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-novis-anthracite">{value}</p>
      {description && (
        <p className="mt-1.5 sm:mt-2 text-xs text-novis-brown truncate hidden sm:block">{description}</p>
      )}
    </div>
  );
}

export default StatCard;
