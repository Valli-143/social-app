import { useState } from "react";

/* ✅ Render Backend */
const API = "https://social-app-backend-b6dw.onrender.com";

export default function Posts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePost(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select media");
      return;
    }

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("caption", caption);
    formData.append("media", file);

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      await res.json();
      alert("Posted successfully ✅");

      setCaption("");
      setFile(null);
    } catch (err) {
      alert("Post failed ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="post-create-page">
      <h2>Create POST</h2>

      <form onSubmit={handlePost}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={e => setFile(e.target.files[0])}
        />

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
