// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

// ================= APP & SERVER =================
const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= PATHS =================
const DATA_DIR = "./data";
const USERS_FILE = "./data/users.json";
const POSTS_FILE = "./data/posts.json";
const MESSAGES_FILE = "./data/messages.json";
const NOTIFY_FILE = "./data/notifications.json";
const PROFILE_DIR = "./uploads/profiles";
const POSTS_DIR = "./uploads/posts";
const JWT_SECRET = "varanasix_secret";

// ================= INIT =================
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR);
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);

for (const f of [USERS_FILE, POSTS_FILE, NOTIFY_FILE, MESSAGES_FILE]) {
  if (!fs.existsSync(f)) fs.writeFileSync(f, "[]");
}

// ================= HELPERS =================
const read = f => JSON.parse(fs.readFileSync(f));
const save = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// ================= OTP STORE =================
const otpStore = {};

// ================= MULTER =================
const postUpload = multer({
  storage: multer.diskStorage({
    destination: POSTS_DIR,
    filename: (_, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname),
  }),
});

// ================= SOCKET STATE =================
const activeSockets = {}; // username -> socket.id

// ================= SOCKET =================
io.on("connection", socket => {
  socket.on("join", username => {
    if (!username) return;
    activeSockets[username] = socket.id;
    socket.join(`user:${username}`);
  });

  socket.on("sendMessage", msg => {
    const messages = read(MESSAGES_FILE);
    const clean = {
      from: msg.from,
      to: msg.to,
      text: msg.text,
      createdAt: new Date().toISOString(),
    };
    messages.push(clean);
    save(MESSAGES_FILE, messages);

    io.to(`user:${msg.from}`).emit("newMessage", clean);
    io.to(`user:${msg.to}`).emit("newMessage", clean);
  });

  socket.on("disconnect", () => {
    Object.keys(activeSockets).forEach(u => {
      if (activeSockets[u] === socket.id) delete activeSockets[u];
    });
  });
});

// ================= OTP =================
app.post("/api/auth/send-otp", (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = {
    otp,
    verified: false,
    exp: Date.now() + 5 * 60 * 1000,
  };
  console.log("OTP:", otp);
  res.json({ message: "OTP sent" });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const r = otpStore[email];
  if (!r || r.otp !== otp || Date.now() > r.exp)
    return res.status(400).json({ message: "Invalid OTP" });
  r.verified = true;
  res.json({ message: "Verified" });
});

// ================= REGISTER =================
app.post("/api/auth/register", async (req, res) => {
  const { username, password, email, gender } = req.body;
  const users = read(USERS_FILE);

  if (users.find(u => u.username === username))
    return res.status(400).json({ message: "Username exists" });

  const hash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    username,
    password: hash,
    email,
    gender,
    bio: "",
    avatar: "",
    followers: [],
    following: [],
  });

  save(USERS_FILE, users);
  res.json({ message: "Registered" });
});

// ================= LOGIN =================
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body;
  const users = read(USERS_FILE);
  const user = users.find(
    u => u.username === identifier || u.email === identifier
  );
  if (!user) return res.status(400).json({ message: "Invalid" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid" });

  res.json({
    token: jwt.sign({ id: user.id }, JWT_SECRET),
    user: {
      username: user.username,
      email: user.email,
      gender: user.gender,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers.length,
      following: user.following.length,
      followingList: user.following,
    },
  });
});

// ================= PROFILE =================
app.get("/api/profile/:username", (req, res) => {
  const users = read(USERS_FILE);
  const posts = read(POSTS_FILE);
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({});
  res.json({
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    followers: user.followers.length,
    following: user.following.length,
    posts: posts.filter(p => p.username === user.username),
  });
});

// ================= POSTS =================
app.post("/api/posts", postUpload.single("media"), (req, res) => {
  const posts = read(POSTS_FILE);
  const post = {
    id: Date.now(),
    username: req.body.username,
    caption: req.body.caption || "",
    media: `/uploads/posts/${req.file.filename}`,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
  };
  posts.unshift(post);
  save(POSTS_FILE, posts);
  res.json(post);
});

app.get("/api/posts", (req, res) => {
  res.json(read(POSTS_FILE));
});

// ================= LIKE =================
app.post("/api/posts/:id/like", (req, res) => {
  const { username } = req.body;
  const posts = read(POSTS_FILE);
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({});

  if (post.likes.includes(username)) {
    post.likes = post.likes.filter(u => u !== username);
  } else {
    post.likes.push(username);
  }

  save(POSTS_FILE, posts);
  res.json(post);
});

// ================= COMMENT =================
app.post("/api/posts/:id/comment", (req, res) => {
  const { username, text } = req.body;
  const posts = read(POSTS_FILE);
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({});

  post.comments.push({
    id: Date.now(),
    username,
    text,
    createdAt: new Date().toISOString(),
  });

  save(POSTS_FILE, posts);
  res.json(post);
});

// ================= FOLLOW / UNFOLLOW =================
app.post("/api/follow", (req, res) => {
  const { from, to } = req.body;
  const users = read(USERS_FILE);

  const me = users.find(u => u.username === from);
  const other = users.find(u => u.username === to);

  if (!me.following.includes(to)) {
    me.following.push(to);
    other.followers.push(from);
  }

  save(USERS_FILE, users);
  res.json({ message: "Followed" });
});

app.post("/api/unfollow", (req, res) => {
  const { from, to } = req.body;
  const users = read(USERS_FILE);

  const me = users.find(u => u.username === from);
  const other = users.find(u => u.username === to);

  me.following = me.following.filter(u => u !== to);
  other.followers = other.followers.filter(u => u !== from);

  save(USERS_FILE, users);
  res.json({ message: "Unfollowed" });
});

// ================= RANDOM GENDER CHAT =================
app.get("/api/random-chat/:username", (req, res) => {
  const users = read(USERS_FILE);
  const me = users.find(u => u.username === req.params.username);
  if (!me) return res.status(404).json({});

  const targetGender = me.gender === "male" ? "female" : "male";
  const list = users.filter(
    u => u.gender === targetGender && u.username !== me.username
  );

  if (!list.length)
    return res.status(404).json({ message: "No users available" });

  const randomUser = list[Math.floor(Math.random() * list.length)];
  res.json({ username: randomUser.username });
});

// ================= NOTIFICATIONS =================
app.get("/api/notifications/:username", (req, res) => {
  const all = read(NOTIFY_FILE);
  res.json(all.filter(n => n.to === req.params.username));
});

// ================= START =================
server.listen(4000, () =>
  console.log("🚀 VARANASIX backend running on http://localhost:4000")
);
