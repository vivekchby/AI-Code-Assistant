const ScoreCard = ({ score }) => {
  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-2">
        Overall Score
      </h2>

      <p className="text-5xl font-bold text-blue-600">
        {score ?? 0}/100
      </p>
    </div>
  );
};

export default ScoreCard;