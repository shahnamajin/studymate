const axios = require("axios");
const Question = require("../models/Question");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

async function submitQuestion(req, res) {
  const { questionText } = req.body;

  if (!questionText || questionText.trim() === "") {
    return res.status(400).json({ message: "Question text is required" });
  }

  try {
    // Call the Python ML service to get similar questions and auto tag
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, {
      question: questionText.trim(),
    });

    const { tag, similar_questions } = mlResponse.data;

    // Save to database
    const saved = await Question.create({
      userId: req.userId,
      questionText: questionText.trim(),
      tag,
      similarQuestions: similar_questions,
    });

    res.status(201).json({
      message: "Question analyzed successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Error calling ML service:", err.message);

    // If ML service is down, save with fallback tag
    const fallbackTag = getFallbackTag(questionText);
    const saved = await Question.create({
      userId: req.userId,
      questionText: questionText.trim(),
      tag: fallbackTag,
      similarQuestions: [],
    });

    res.status(201).json({
      message: "Question saved (ML service unavailable)",
      data: saved,
    });
  }
}

async function getHistory(req, res) {
  const { search, tag } = req.query;

  let filter = { userId: req.userId };

  if (tag && tag !== "All") {
    filter.tag = tag;
  }

  if (search) {
    filter.questionText = { $regex: search, $options: "i" };
  }

  try {
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json({ data: questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Simple keyword fallback in case ML service is down
function getFallbackTag(question) {
  const text = question.toLowerCase();

  if (/photosynthesis|chlorophyll|biology|cell|organism|dna|protein|mitosis/.test(text))
    return "Biology";
  if (/database|sql|normalization|dbms|query|table|index|join/.test(text))
    return "Computer Science";
  if (/force|motion|gravity|velocity|acceleration|energy|wave|newton/.test(text))
    return "Physics";
  if (/integral|derivative|equation|matrix|probability|calculus|algebra/.test(text))
    return "Mathematics";
  if (/reaction|element|compound|acid|base|molecule|chemistry|bond/.test(text))
    return "Chemistry";
  if (/history|war|civilization|empire|revolution|country|economy/.test(text))
    return "Social Science";

  return "General";
}

module.exports = { submitQuestion, getHistory };
