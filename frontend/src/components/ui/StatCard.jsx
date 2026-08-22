function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-novis-bronze/20 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="mt-2 text-3xl font-bold text-novis-anthracite">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-novis-brown">{description}</p>
      )}
    </div>
  );
}

export default StatCard;
