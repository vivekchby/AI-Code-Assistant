import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCode } from "react-icons/fa";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      const { token, user } = res.data;
      login(user, token);
      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 text-white bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-500 p-3 rounded-xl">
            <FaCode size={24} />
          </div>

          <h1 className="text-3xl font-bold">
            AI Reviewer
          </h1>
        </div>

        <h2 className="text-6xl font-bold mb-6">
          AI Code Review Assistant
        </h2>

        <p className="text-gray-400 text-lg">
          Get intelligent code reviews and
          improve your code quality with AI.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2">
            Welcome Back 👋
          </h1>

          <p className="text-gray-500 mb-8">
            Sign in to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-emerald-500
                text-white
                p-4
                rounded-xl
                hover:bg-emerald-600
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-500"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
