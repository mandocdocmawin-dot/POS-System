import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
export function FullscreenButton() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const change = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setError("Fullscreen is unavailable in this browser.");
      setTimeout(() => setError(""), 3000);
    }
  }
  return (
    <div className="relative">
      <button
        aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}
        className="icon-btn"
        onClick={() => void toggle()}
      >
        {active ? <Minimize size={17} /> : <Maximize size={17} />}
      </button>
      {error && (
        <p
          role="status"
          className="card absolute right-0 top-12 z-50 w-56 text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
