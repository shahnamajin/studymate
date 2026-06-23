const mongoose = require("mongoose");

const similarQuestionSchema = new mongoose.Schema({
  text: String,
  similarity: Number, // percentage like 87.5
});

const questionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "General",
    },
    similarQuestions: [similarQuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
