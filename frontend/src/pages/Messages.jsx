import { useEffect, useState } from "react";
import { FiSearch, FiShuffle } from "react-icons/fi";
import { io } from "socket.io-client";
import "./Messages.css";

const API = "http://localhost:4000";
const SOCKET_URL = "http://localhost:4000";

export default function Messages() {
  const stored = JSON.parse(localStorage.getItem("user"));
  const [socket, setSocket] = useState(null);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ================= SOCKET =================
  useEffect(() => {
    const s = io(SOCKET_URL);
    s.emit("join", stored.username);

    s.on("newMessage", msg => {
      if (msg.from === selectedUser || msg.to === selectedUser) {
        setMessages(prev => [...prev, msg]);
      }
    });

    setSocket(s);
    return () => s.disconnect();
  }, [selectedUser]);

  // ================= SEARCH =================
  useEffect(() => {
    if (!search) return setUsers([]);

    fetch(`${API}/api/profile/${search}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUsers(data ? [data] : []));
  }, [search]);

  // ================= SEND =================
  function sendMessage() {
    if (!text || !selectedUser) return;

    socket.emit("sendMessage", {
      from: stored.username,
      to: selectedUser,
      text,
    });

    setText("");
  }

  // ================= RANDOM CONNECT =================
  async function randomConnect() {
    const res = await fetch(`${API}/api/random-chat/${stored.username}`);
    if (!res.ok) return alert("No opposite gender users");

    const data = await res.json();
    setSelectedUser(data.username);
    setMessages([]);
  }

  return (
    <div className="dm-page">
      {/* LEFT */}
      <div className="dm-left">
        <div className="dm-top">
          <h3>Messages</h3>
          <div className="dm-icons">
            <FiSearch />
            <FiShuffle onClick={randomConnect} />
          </div>
        </div>

        <input
          className="dm-search"
          placeholder="Search user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {users.map(u => (
          <div
            key={u.username}
            className="dm-user"
            onClick={() => {
              setSelectedUser(u.username);
              setMessages([]);
            }}
          >
            @{u.username}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="dm-right">
        {selectedUser ? (
          <>
            <div className="dm-header">@{selectedUser}</div>

            <div className="dm-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.from === stored.username ? "dm-msg me" : "dm-msg"}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="dm-input">
              <input
                placeholder="Type a message..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p className="dm-empty">Start a conversation 💬</p>
        )}
      </div>
    </div>
  );
}
