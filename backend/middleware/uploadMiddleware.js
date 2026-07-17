const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".ts"
  ];

  const ext = path.extname(
    file.originalname
  );

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Unsupported file type"),
      false
    );
  }
};

module.exports = multer({
  storage,
  fileFilter
});