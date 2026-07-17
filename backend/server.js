const express = require("express");
const cors = require("cors");
require("dotenv").config();
const testRoute = require("./routes/testRoute");
const app = express();
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require(
  "./routes/reviewRoutes"
);


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/test", testRoute);
app.use(
  "/api/reviews",
  reviewRoutes
);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Code Review Assistant API Running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});