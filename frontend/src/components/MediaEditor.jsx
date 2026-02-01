import { useState } from "react";
import "./MediaEditor.css";

export default function MediaEditor({ file, onPost }) {
  const [caption, setCaption] = useState("");

  const preview = URL.createObjectURL(file);

  return (
    <div className="editor">
      {file.type.startsWith("image") ? (
        <img src={preview} />
      ) : (
        <video src={preview} controls />
      )}

      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button onClick={() => onPost(file, caption)}>Post</button>
    </div>
  );
}
