import { useEffect, useState } from "react";
import "./InstallPrompt.css";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setShow(false);
      setDeferredPrompt(null);
    });
  }

  function continueWeb() {
    setShow(false);
    localStorage.setItem("continue_web", "true");
  }

  if (!show || localStorage.getItem("continue_web")) return null;

  return (
    <div className="install-overlay">
      <div className="install-box">
        <h2>Install VARANASIX</h2>
        <p>Get the app experience on your device</p>

        <button onClick={installApp} className="install-btn">
          📥 Download App
        </button>

        <button onClick={continueWeb} className="web-btn">
          🌐 Continue on Website
        </button>
      </div>
    </div>
  );
}
