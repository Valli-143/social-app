export default function MediaPicker({ onSelect }) {
  return (
    <>
      {/* Camera */}
      <input
        type="file"
        accept="image/*,video/*"
        capture="environment"
        hidden
        id="cameraInput"
        onChange={(e) => onSelect(e.target.files[0])}
      />

      {/* Gallery */}
      <input
        type="file"
        accept="image/*,video/*"
        hidden
        id="galleryInput"
        onChange={(e) => onSelect(e.target.files[0])}
      />

      <button onClick={() => document.getElementById("cameraInput").click()}>
        📷 Camera
      </button>

      <button onClick={() => document.getElementById("galleryInput").click()}>
        🖼 Gallery
      </button>
    </>
  );
}
