const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { submitQuestion, getHistory } = require("../controllers/questionController");

// Both routes require login
router.post("/", verifyToken, submitQuestion);
router.get("/history", verifyToken, getHistory);

module.exports = router;
