const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;