import React from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-bold text-indigo-600">StudyMate</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-indigo-600 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            className="text-gray-600 hover:text-indigo-600 text-sm font-medium"
          >
            History
          </Link>
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-gray-500">Hi, {user.name || "User"}</span>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
