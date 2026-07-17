const supabase = require("../config/db");
const analyzeCode = require("../services/analysisService");
const reviewCode = require("../services/aiService");
const analyzeComplexity = require("../services/complexityService");

const deleteReview = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { error } =
      await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message:
        "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getReviewById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { data, error } =
      await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    res.json({
      success: true,
      review: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    res.json({
      success: true,
      reviews: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const analyzeAndReview = async (req, res) => {
  try {
    const { code, language, userId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required"
      });
    }

    const issues = await analyzeCode(code, language);
    const { review: aiReview, aiScore, correctedCode } = await reviewCode(code);

    // Complexity analysis
    const complexity = analyzeComplexity(code, language);

    // The AI evaluates overall code quality for every language. ESLint is a
    // deterministic safety net: confirmed lint issues may lower that score,
    // but a clean lint run must not automatically mean perfect code.
    const lintDeduction = issues.reduce((sum, issue) => {
      if (issue.severity === 2) return sum + 12;
      if (issue.severity === 1) return sum + 5;
      return sum + 1;
    }, 0);
    const lintScore = Math.max(100 - lintDeduction, 0);
    const validAiScore = Number.isInteger(aiScore) && aiScore >= 0 && aiScore <= 100;
    const score = validAiScore ? Math.min(aiScore, lintScore) : lintScore;

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          user_id: userId,
          language,
          source_code: code,
          overall_score: score,
          summary: `${issues.length} issues found`,
          ai_review: aiReview,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      issues,
      aiReview,
      correctedCode,
      complexity,
      review: data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  analyzeAndReview,
  getReviews, deleteReview,getReviewById,
};
