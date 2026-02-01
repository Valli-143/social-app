import { useNavigate } from "react-router-dom";
import "./CreateModal.css";

export default function CreateModal({ close }) {
  const navigate = useNavigate();

  return (
    <div className="create-overlay" onClick={close}>
      <div className="create-box" onClick={(e) => e.stopPropagation()}>
        <h2>Create</h2>

        <button onClick={() => navigate("/posts")}>
          📸 Post
        </button>

        <button onClick={() => navigate("/video")}>
          🎥 Video
        </button>

        <button onClick={() => navigate("/reels")}>
          🎬 Reel
        </button>

        <button className="cancel" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
