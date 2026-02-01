import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import "./Profile.css";

const API = "http://localhost:4000";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const stored = JSON.parse(localStorage.getItem("user"));
  const viewUser = username || stored.username;
  const isMyProfile = viewUser === stored.username;

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [followingList, setFollowingList] = useState(
    stored.followingList || []
  );

  const fileInputRef = useRef(null);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    fetch(`${API}/api/profile/${viewUser}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setBio(data.bio || "");
      });
  }, [viewUser]);

  /* ================= SAVE PROFILE ================= */
  async function saveProfile() {
    const form = new FormData();
    form.append("username", stored.username);
    form.append("bio", bio);

    if (avatarFile) {
      form.append("avatar", avatarFile);
    }

    await fetch(`${API}/api/profile/update`, {
      method: "PUT",
      body: form,
    });

    setEditing(false);
    setAvatarFile(null);

    const updated = await fetch(
      `${API}/api/profile/${stored.username}`
    ).then(res => res.json());

    setProfile(updated);

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...stored,
        avatar: updated.avatar,
        bio: updated.bio,
      })
    );
  }

  /* ================= FOLLOW ================= */
  async function followUser() {
    await fetch(`${API}/api/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: stored.username, to: viewUser }),
    });

    const updated = [...followingList, viewUser];
    setFollowingList(updated);

    localStorage.setItem(
      "user",
      JSON.stringify({ ...stored, followingList: updated })
    );

    setProfile(p => ({ ...p, followers: p.followers + 1 }));
  }

  /* ================= UNFOLLOW ================= */
  async function unfollowUser() {
    await fetch(`${API}/api/unfollow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: stored.username, to: viewUser }),
    });

    const updated = followingList.filter(u => u !== viewUser);
    setFollowingList(updated);

    localStorage.setItem(
      "user",
      JSON.stringify({ ...stored, followingList: updated })
    );

    setProfile(p => ({ ...p, followers: p.followers - 1 }));
  }

  /* ================= MESSAGE ================= */
  function openMessage() {
    localStorage.setItem("activeChatUser", viewUser);
    navigate("/messages");
  }

  if (!profile) return null;

  const isFollowing = followingList.includes(viewUser);

  return (
    <div className="profile-page">
      <h1 className="profile-title">VARANASIX</h1>

      {/* ================= AVATAR ================= */}
      <div className="profile-avatar-wrapper">
        <img
          className="profile-avatar"
          src={
            profile.avatar
              ? `${API}${profile.avatar}`
              : "/default-avatar.png"
          }
          alt="profile"
        />

        {isMyProfile && (
          <>
            <div
              className="edit-profile-icon"
              onClick={() => fileInputRef.current.click()}
            >
              <FiEdit />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                setAvatarFile(e.target.files[0]);
                setEditing(true);
              }}
            />
          </>
        )}
      </div>

      <h2 className="profile-username">@{profile.username}</h2>

      {/* ================= STATS ================= */}
      <div className="profile-stats">
        <div>
          <b>{profile.postsCount}</b>
          <span>Posts</span>
        </div>
        <div>
          <b>{profile.followers}</b>
          <span>Followers</span>
        </div>
        <div>
          <b>{profile.following}</b>
          <span>Following</span>
        </div>
      </div>

      {/* ================= BIO ================= */}
      {editing ? (
        <div className="profile-edit-box">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
          <button onClick={saveProfile}>Save</button>
        </div>
      ) : (
        <p className="profile-bio">{profile.bio}</p>
      )}

      {/* ================= ACTIONS ================= */}
      {!isMyProfile && (
        <div className="profile-actions">
          {isFollowing ? (
            <button className="unfollow-btn" onClick={unfollowUser}>
              Unfollow
            </button>
          ) : (
            <button className="follow-btn" onClick={followUser}>
              Follow
            </button>
          )}

          <button className="message-btn" onClick={openMessage}>
            Message
          </button>
        </div>
      )}

      {/* ================= POSTS ================= */}
      <h3 className="profile-section">Posts</h3>
      <div className="profile-posts">
        {profile.posts.map(p => (
          <img key={p.id} src={`${API}${p.media}`} alt="" />
        ))}
      </div>
    </div>
  );
}
