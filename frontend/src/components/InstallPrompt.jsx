import { useEffect, useState } from "react";
import "./InstallPrompt.css";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // ✅ If user already made a choice, don't show again
    const choiceDone = localStorage.getItem("app_choice_done");
    if (choiceDone) return;

    // ✅ If app already installed (PWA), don't show
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      localStorage.setItem("app_choice_done", "yes");
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    localStorage.setItem("app_choice_done", "yes");
    setShow(false);
    setDeferredPrompt(null);
  }

  function continueWeb() {
    localStorage.setItem("app_choice_done", "yes");
    setShow(false);
  }

  if (!show) return null;

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
