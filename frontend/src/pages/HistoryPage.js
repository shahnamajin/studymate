import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TagBadge from "../components/TagBadge";
import { getHistory } from "../services/api";

const ALL_TAGS = [
  "All",
  "Biology",
  "Computer Science",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Social Science",
  "General",
];

function HistoryPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [search, selectedTag]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedTag !== "All") params.tag = selectedTag;

      const res = await getHistory(params);
      setQuestions(res.data.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Question History</h2>
          <p className="text-gray-500 text-sm mt-1">
            All your past questions with their topic tags and similar matches.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your questions..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  selectedTag === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3 animate-pulse">📂</div>
            <p className="text-gray-400 text-sm">Loading your history...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="text-4xl mb-3">🗒️</div>
            <p className="text-gray-600 font-medium">No questions found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try a different filter or ask your first question on the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(q._id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">
                        {q.questionText}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <TagBadge tag={q.tag} />
                        <span className="text-xs text-gray-400">
                          {formatDate(q.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm mt-0.5">
                      {expandedId === q._id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded: similar questions */}
                {expandedId === q._id && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {q.similarQuestions && q.similarQuestions.length > 0 ? (
                      <>
                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                          Similar Questions
                        </p>
                        <div className="space-y-2">
                          {q.similarQuestions.map((sq, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between gap-2 text-sm"
                            >
                              <span className="text-gray-600">
                                {i + 1}. {sq.text}
                              </span>
                              <span className="text-xs text-indigo-600 font-semibold whitespace-nowrap">
                                {sq.similarity}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">No similar questions recorded.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && questions.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Showing {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
