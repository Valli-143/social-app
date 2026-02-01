const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const POSTS_FILE = path.join(__dirname, "../data/posts.json");

// ---------- HELPERS ----------
function loadPosts() {
  if (!fs.existsSync(POSTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8"));
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/posts"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------- CREATE POST ----------
router.post("/", upload.single("media"), (req, res) => {
  try {
    const { username, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Media required" });
    }

    const posts = loadPosts();

    const post = {
      id: Date.now().toString(),
      username,
      caption,
      media: `/uploads/posts/${req.file.filename}`,
      createdAt: new Date(),
      likes: [],
      comments: []
    };

    posts.unshift(post);
    savePosts(posts);

    res.json({ message: "Post created", post });
  } catch (e) {
    res.status(500).json({ message: "Post failed" });
  }
});

// ---------- GET ALL POSTS ----------
router.get("/", (req, res) => {
  res.json(loadPosts());
});

module.exports = router;
