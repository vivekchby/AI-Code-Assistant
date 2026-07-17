import { FaCode } from "react-icons/fa";

const EmptyState = ({
  title,
  description,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-12 text-center">
      <FaCode
        className="mx-auto text-emerald-500 mb-4"
        size={50}
      />

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="text-gray-500 mt-3">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;