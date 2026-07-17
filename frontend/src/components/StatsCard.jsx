const StatsCard = ({
  title,
  value,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-4xl font-bold text-emerald-500 mt-3">
        {value}
      </h2>
    </div>
  );
};

export default StatsCard;
