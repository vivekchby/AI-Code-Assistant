import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  Link,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCode,
  FaRobot,
  FaInfoCircle,
  FaStar,
} from "react-icons/fa";
import api from "../services/api";

const ReviewDetails = () => {
  const { id } = useParams();

  const [review, setReview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("overview");

  useEffect(() => {
    fetchReview();
  }, []);

  const fetchReview = async () => {
    try {
      const res = await api.get(
        `/reviews/${id}`
      );

      setReview(res.data.review);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
          <h1 className="text-3xl font-bold">
            Loading...
          </h1>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
          <h1 className="text-3xl font-bold">
            Review Not Found
          </h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <Link
          to="/history"
          className="
          inline-flex
          items-center
          gap-2
          text-gray-500
          mb-6
          hover:text-emerald-500
          "
        >
          <FaArrowLeft />
          Back to History
        </Link>

        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Review Details
            </h1>

            <p className="text-gray-500 mt-3">
              Generated on{" "}
              {new Date(
                review.created_at
              ).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 min-w-[250px]">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-4 rounded-2xl">
                <FaStar
                  className="text-emerald-500"
                  size={28}
                />
              </div>

              <div>
                <p className="text-gray-500">
                  Score
                </p>

                <h1 className="text-5xl font-bold text-emerald-500">
                  {review.overall_score}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg">
          <div className="flex overflow-x-auto border-b">
            <button
              onClick={() =>
                setActiveTab(
                  "overview"
                )
              }
              className={`px-6 py-5 font-semibold ${
                activeTab ===
                "overview"
                  ? "text-emerald-500 border-b-2 border-emerald-500"
                  : "text-gray-500"
              }`}
            >
              <FaInfoCircle className="inline mr-2" />
              Overview
            </button>

            <button
              onClick={() =>
                setActiveTab("code")
              }
              className={`px-6 py-5 font-semibold ${
                activeTab === "code"
                  ? "text-emerald-500 border-b-2 border-emerald-500"
                  : "text-gray-500"
              }`}
            >
              <FaCode className="inline mr-2" />
              Source Code
            </button>

            <button
              onClick={() =>
                setActiveTab("ai")
              }
              className={`px-6 py-5 font-semibold ${
                activeTab === "ai"
                  ? "text-emerald-500 border-b-2 border-emerald-500"
                  : "text-gray-500"
              }`}
            >
              <FaRobot className="inline mr-2" />
              AI Review
            </button>
          </div>

          <div className="p-8">
            {activeTab ===
              "overview" && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Summary
                  </h2>

                  <p>
                    {review.summary ||
                      "No summary available."}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <p>
                    <strong>
                      Language:
                    </strong>{" "}
                    {review.language}
                  </p>

                  <p className="mt-3">
                    <strong>
                      Created:
                    </strong>{" "}
                    {new Date(
                      review.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="bg-slate-900 rounded-2xl p-6 overflow-auto">
                <pre className="text-green-400 whitespace-pre-wrap">
                  {review.source_code}
                </pre>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="bg-slate-50 rounded-2xl p-6">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {review.ai_review}
                </pre>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default ReviewDetails;