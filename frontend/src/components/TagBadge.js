import React from "react";

const tagColors = {
  Biology: "bg-green-100 text-green-700",
  "Computer Science": "bg-blue-100 text-blue-700",
  Physics: "bg-purple-100 text-purple-700",
  Mathematics: "bg-yellow-100 text-yellow-700",
  Chemistry: "bg-orange-100 text-orange-700",
  "Social Science": "bg-pink-100 text-pink-700",
  General: "bg-gray-100 text-gray-600",
};

function TagBadge({ tag }) {
  const colorClass = tagColors[tag] || tagColors["General"];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {tag}
    </span>
  );
}

export default TagBadge;
