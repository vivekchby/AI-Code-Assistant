import {
  useEffect,
  useState,
  useContext,
} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

const History = () => {
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/reviews/history/${user.id}`
      );

      setReviews(res.data.reviews || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/reviews/${id}`);

      setReviews((prev) =>
        prev.filter(
          (review) => review.id !== id
        )
      );
    } catch (err) {
      console.log(err);
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.summary
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      review.language
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <div
        className="
          bg-gradient-to-r
          from-indigo-500
          to-purple-600
          rounded-3xl
          p-6 md:p-8
          text-white
          mb-8
          "
      >
        <h1 className="text-4xl font-bold">
          Review History
        </h1>

        <p className="mt-3 text-lg opacity-90">
          Browse and manage your past code reviews.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by summary or language..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-xl p-3 mb-6 bg-white border-gray-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition"
      />

        {loading ? (
          <div>
            <p>Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="border rounded-2xl p-8 text-center bg-white border-gray-200">
            No reviews found.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-2xl p-6 mb-5 shadow-sm bg-white border-gray-200"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <p className="mb-2">
                    <strong>Score:</strong>{" "}
                    {review.overall_score ??
                      "N/A"}
                  </p>

                  <p className="mb-2">
                    <strong>Summary:</strong>{" "}
                    {review.summary ||
                      "No summary"}
                  </p>

                  <p className="mb-2">
                    <strong>Language:</strong>{" "}
                    {review.language ||
                      "N/A"}
                  </p>

                  <p className="mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(
                      review.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link
                    to={`/reviews/${review.id}`}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-center transition"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() =>
                      handleDelete(
                        review.id
                      )
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-center transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
    </div>
  );
};

export default History;