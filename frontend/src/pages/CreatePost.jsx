import { useState } from "react";
import "./CreatePost.css";

/* ✅ Render Backend */
const API = "https://social-app-backend-b6dw.onrender.com";

export default function CreatePost() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  async function handlePost(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select photo or video");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);
    formData.append("caption", caption);
    formData.append("type", file.type.startsWith("video") ? "video" : "image");
    formData.append("username", user.username);

    const res = await fetch(`${API}/api/posts/create`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Post failed");
      return;
    }

    alert("Post created successfully ✅");
    setFile(null);
    setCaption("");
  }

  return (
    <div className="create-post-page">
      <h2>Create Post</h2>

      <form onSubmit={handlePost}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button type="submit">Post</button>
      </form>
    </div>
  );
}
