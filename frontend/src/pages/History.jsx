import {
  useEffect,
  useState,
  useContext,
} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
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
        `/api/reviews/history/${user.id}`
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
      await api.delete(`/api/reviews/${id}`);

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
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Review History
        </h1>

        <input
          type="text"
          placeholder="Search by summary or language..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded p-3 mb-6 bg-white dark:bg-slate-800 dark:border-slate-700"
        />

        {loading ? (
          <div>
            <p>Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="border rounded p-6 text-center bg-white dark:bg-slate-800 dark:border-slate-700">
            No reviews found.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="border rounded p-5 mb-5 shadow bg-white dark:bg-slate-800 dark:border-slate-700"
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
                    className="bg-blue-500 text-white px-4 py-2 rounded text-center"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() =>
                      handleDelete(
                        review.id
                      )
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;