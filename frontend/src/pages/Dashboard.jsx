import { useState, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";
import ReviewResult from "../components/ReviewResult";
import StatsCard from "../components/StatsCard";
import api from "../services/api";
import { detectLanguage, SUPPORTED_LANGUAGES } from "../utils/detectLanguage";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [code, setCode] = useState("");
  const [correctedCode, setCorrectedCode] = useState("");
  const [issues, setIssues] = useState([]);
  const [complexity, setComplexity] = useState(null);
  const [aiReview, setAiReview] =
    useState("");
  const [score, setScore] =
    useState(0);
  const [loading, setLoading] =
    useState(false);
  const [language, setLanguage] =
    useState("plaintext");
  const [languageDetected, setLanguageDetected] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error(
        "Please enter some code."
      );
      return;
    }
    console.log("Current user:", user);
console.log("User ID:", user?.id);

    if (!user?.id) {
      toast.error(
        "You must be logged in to request a review."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/reviews/full-review",
        {
          userId: user.id,
          language,
          code,
        }
      );

      setIssues(
        res.data.issues || []
      );
      setComplexity(res.data.complexity || null);
      setAiReview(
        res.data.aiReview || ""
      );
      setCorrectedCode(res.data.correctedCode || code);

      setScore(
        res.data.review
          ?.overall_score || 0
      );

      toast.success(
        "Review generated successfully!"
      );
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.message ||
          "Review failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);
      setCorrectedCode("");
      if (newCode && !languageDetected) {
        const detected = detectLanguage(newCode);
        if (detected !== "plaintext") {
          setLanguage(detected);
          setLanguageDetected(true);
        }
      }
    },
    [languageDetected]
  );

  const handleFileUpload =
    async (e) => {
      const file =
        e.target.files[0];

      if (!file) return;

      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      switch (extension) {
        case "js":
          setLanguage(
            "javascript"
          );
          break;

        case "py":
          setLanguage(
            "python"
          );
          break;

        case "java":
          setLanguage("java");
          break;

        case "cpp":
        case "cc":
        case "cxx":
          setLanguage("cpp");
          break;

        case "c":
          setLanguage("c");
          break;

        default:
          setLanguage(
            "plaintext"
          );
      }

      const formData =
        new FormData();

      formData.append(
        "codeFile",
        file
      );

      try {
        const res =
          await api.post(
            "/reviews/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        setCode(res.data.code);
        setCorrectedCode("");

        // Auto-detect language from uploaded code content
        const detected = detectLanguage(res.data.code);
        if (detected !== "plaintext") {
          setLanguage(detected);
          setLanguageDetected(true);
        }

        toast.success(
          `${file.name} uploaded successfully`
        );
      } catch (err) {
        console.log(err);

        toast.error(
          "Upload failed"
        );
      }
    };

  return (
    <DashboardLayout>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        {/* Hero */}
        <div
          className="
          bg-gradient-to-r
          from-emerald-500
          to-teal-600
          rounded-3xl
          p-6 md:p-8
          text-white
          mb-8
          "
        >
          <h1 className="text-4xl font-bold">
            Welcome back,
            {" "}
            {user?.name}
            {" "}
            👋
          </h1>

          <p className="mt-3 text-lg opacity-90">
            Analyze your code and
            receive AI-powered
            suggestions instantly.
          </p>
        </div>

        {/* Stats */}
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
          mb-8
          "
        >
          <StatsCard
            title="Score"
            value={`${score}/100`}
          />

          <StatsCard
            title="Issues Found"
            value={issues.length}
          />

          <StatsCard
            title="Language"
            value={language}
          />
        </div>

        {/* Language Selector + Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label
              className="
              block
              mb-2
              font-semibold
              text-gray-700
              "
            >
              Language
            </label>

            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setLanguageDetected(true);
              }}
              className="
              block
              w-full
              border
              rounded-xl
              p-3
              bg-white
              "
              disabled
            >
              {SUPPORTED_LANGUAGES.map(
                (lang) => (
                  <option
                    key={lang.value}
                    value={lang.value}
                  >
                    {lang.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              className="
              block
              mb-2
              font-semibold
              text-gray-700
              "
            >
              Upload Source File
            </label>

            <input
              type="file"
              accept="
              .js,
              .py,
              .java,
              .cpp,
              .c
              "
              onChange={
                handleFileUpload
              }
              className="
              block
              w-full
              border
              rounded-xl
              p-3
              bg-white
              "
              disabled
            />
          </div>
        </div>

        {/* Code Editors */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Your Code</h2>
            <CodeEditor
              code={code}
              setCode={handleCodeChange}
              language={language}
            />
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Corrected Code</h2>
            <CodeEditor
              code={correctedCode || "// Corrected code will appear here after review."}
              setCode={() => {}}
              language={language}
              readOnly
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleReview}
          disabled={loading}
          className="
          w-full
          md:w-auto
          bg-emerald-500
          hover:bg-emerald-600
          text-white
          px-8
          py-3
          rounded-2xl
          shadow-lg
          transition
          disabled:bg-gray-400
          "
        >
          {loading
            ? "Analyzing..."
            : "Review Code"}
        </button>

        {/* Results */}
        {(issues.length > 0 ||
          aiReview) && (
          <ReviewResult
            issues={issues}
            aiReview={aiReview}
            score={score}
            complexity={complexity}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
