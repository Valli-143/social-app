import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import Reels from "./pages/Reels";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  return (
    <BrowserRouter basename="/social-app">
      {/* PWA install prompt */}
      <InstallPrompt />

      <Routes>
        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HOME */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
              <BottomNav />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
              <BottomNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
              <BottomNav />
            </ProtectedRoute>
          }
        />

        {/* POSTS */}
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <Posts />
              <BottomNav />
            </ProtectedRoute>
          }
        />

        {/* REELS */}
        <Route
          path="/reels"
          element={
            <ProtectedRoute>
              <Reels />
              <BottomNav />
            </ProtectedRoute>
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
              <BottomNav />
            </ProtectedRoute>
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
              <BottomNav />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
