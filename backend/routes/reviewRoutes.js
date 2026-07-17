const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const analyzeCode = require("../services/analysisService");
const reviewCode =
  require("../services/aiService");

const {
  analyzeAndReview,
  getReviews,
  deleteReview,
  getReviewById,
} = require(
  "../controllers/reviewController"
);

router.get(
  "/:id",
  getReviewById
);
router.get(
  "/history/:userId",
  getReviews
);
router.delete(
  "/:id",
  deleteReview
);
router.post(
  "/upload",
  upload.single("codeFile"),
  async (req, res) => {
    try {
      res.json({
        success: true,
        file: req.file
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);
router.post(
  "/full-review",
  analyzeAndReview
);
router.post(
  "/ai-review",
  async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Code is required"
        });
      }

      const review =
        await reviewCode(code);

      res.json({
        success: true,
        review
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

router.post("/analyze", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required"
      });
    }

    const issues = await analyzeCode(code);

    res.json({
      success: true,
      issues
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


module.exports = router;