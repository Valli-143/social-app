import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUserPlus, FiMessageCircle } from "react-icons/fi";
import { io } from "socket.io-client";
import "./Notifications.css";

const API = "http://localhost:4000";
const SOCKET_URL = "http://localhost:4000";

/* ================= TIME FORMAT ================= */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);

  /* ================= LOAD SAVED NOTIFICATIONS ================= */
  useEffect(() => {
    if (!stored?.username) return;

    fetch(`${API}/api/notifications/${stored.username}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          // ✅ Demo fallback (kept, not removed)
          setNotifications([
            {
              id: 1,
              type: "follow",
              from: "testuser",
              createdAt: new Date(Date.now() - 2 * 60 * 1000),
            },
            {
              id: 2,
              type: "comment",
              from: "rahul",
              createdAt: new Date(Date.now() - 15 * 60 * 1000),
            },
            {
              id: 3,
              type: "follow",
              from: "vicky_67",
              createdAt: new Date(Date.now() - 60 * 60 * 1000),
            },
          ]);
        }
      });
  }, [stored?.username]);

  /* ================= SOCKET REAL-TIME ================= */
  useEffect(() => {
    if (!stored?.username) return;

    const socket = io(SOCKET_URL);

    socket.emit("join", stored.username);

    socket.on("notification", data => {
      setNotifications(prev => [
        {
          id: data.id || Date.now(),
          type: data.type,
          from: data.from,
          createdAt: data.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => socket.disconnect();
  }, [stored?.username]);

  /* ================= CLICK HANDLER ================= */
  function openNotification(n) {
    if (n.type === "follow") {
      navigate(`/profile/${n.from}`);
    } else if (n.type === "comment") {
      navigate("/home"); // can later route to post
    }
  }

  return (
    <div className="notify-page">
      {/* HEADER */}
      <div className="notify-header">
        <FiArrowLeft
          className="back-icon"
          onClick={() => navigate(-1)}
        />
        <h2>Notifications</h2>
      </div>

      {/* LIST */}
      <div className="notify-list">
        {notifications.length === 0 ? (
          <p className="empty-text">No notifications yet</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className="notify-card"
              onClick={() => openNotification(n)}
            >
              <div className="notify-icon">
                {n.type === "follow" ? (
                  <FiUserPlus />
                ) : (
                  <FiMessageCircle />
                )}
              </div>

              <div className="notify-content">
                <p>
                  {n.type === "follow" ? (
                    <>
                      <b>@{n.from}</b> started following you
                    </>
                  ) : (
                    <>
                      <b>@{n.from}</b> commented on your post
                    </>
                  )}
                </p>

                <span className="notify-time">
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
