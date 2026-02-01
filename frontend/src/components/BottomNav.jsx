import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openCreate, setOpenCreate] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ================= CREATE MODAL ================= */}
      {openCreate && (
        <div className="create-overlay">
          <div className="create-modal">
            <h2>Create</h2>

            <button
              onClick={() => {
                setOpenCreate(false);
                navigate("/posts");
              }}
            >
              📸 Create Post
            </button>

            <button
              onClick={() => {
                setOpenCreate(false);
                navigate("/posts?type=video");
              }}
            >
              🎥 Upload Video
            </button>

            <button
              onClick={() => {
                setOpenCreate(false);
                navigate("/reels/create");
              }}
            >
              🎬 Create Reel
            </button>

            <button
              className="cancel"
              onClick={() => setOpenCreate(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVBAR ================= */}
      <div className="bottom-nav">

        <div
          className={`nav-item ${isActive("/home") ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          <span className="nav-icon">🏠</span>
        </div>

        <div
          className={`nav-item ${isActive("/reels") ? "active" : ""}`}
          onClick={() => navigate("/reels")}
        >
          <span className="nav-icon">🎬</span>
        </div>

        {/* CENTER CREATE BUTTON */}
        <div className="nav-item nav-create" onClick={() => setOpenCreate(true)}>
          <span className="nav-add">＋</span>
        </div>

        <div
          className={`nav-item ${isActive("/messages") ? "active" : ""}`}
          onClick={() => navigate("/messages")}
        >
          <span className="nav-icon">💬</span>
        </div>

        <div
          className={`nav-item ${isActive("/profile") ? "active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <span className="nav-icon">👤</span>
        </div>

      </div>
    </>
  );
}
