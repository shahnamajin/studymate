import React, { useState } from "react";
import Navbar from "../components/Navbar";
import TagBadge from "../components/TagBadge";
import { submitQuestion } from "../services/api";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exampleQuestions = [
    "Why does photosynthesis need light?",
    "What is normalization in DBMS?",
    "How does Newton's second law work?",
    "Explain the concept of integration.",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await submitQuestion({ questionText: question });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExampleClick(q) {
    setQuestion(q);
    setResult(null);
  }

  function getSimilarityColor(score) {
    if (score >= 75) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-gray-500 bg-gray-50";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Hello, {user.name || "Student"} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Ask any study question and I'll find similar ones for you.
          </p>
        </div>

        {/* Question Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">
            Enter your study question
          </h3>

          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why does photosynthesis need light?"
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{question.length} characters</span>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Find Similar Questions →"}
              </button>
            </div>
          </form>

          {/* Example Questions */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-3 py-1.5 rounded-lg transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-3 animate-pulse">🔍</div>
            <p className="text-gray-500 text-sm">Searching for similar questions...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Auto Tag */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Topic Detected
                  </p>
                  <TagBadge tag={result.tag} />
                </div>
                <div className="text-2xl">🏷️</div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Your question was automatically classified based on keywords and semantic
                analysis.
              </p>
            </div>

            {/* Similar Questions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔗</span>
                <h3 className="text-base font-semibold text-gray-700">
                  Similar Questions Found
                </h3>
              </div>

              {result.similarQuestions && result.similarQuestions.length > 0 ? (
                <div className="space-y-3">
                  {result.similarQuestions.map((sq, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 text-sm font-medium mt-0.5">
                          {index + 1}.
                        </span>
                        <p className="text-sm text-gray-700">{sq.text}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${getSimilarityColor(
                          sq.similarity
                        )}`}
                      >
                        {sq.similarity}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No similar questions found. Try rephrasing your question.
                </p>
              )}
            </div>

            {/* Saved confirmation */}
            <div className="flex items-center gap-2 text-xs text-gray-400 pl-1">
              <span>✅</span>
              <span>This question has been saved to your history.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
