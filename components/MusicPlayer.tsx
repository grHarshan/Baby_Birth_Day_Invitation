"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

const SONG_PATH =
  "/music/Happy 1st Birthday Little Girl!   Birthday Song for Baby Girl  1 Year Old.mp3";

export default function MusicPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Only render the music player on the primary invitation page
  const isInvitationPage = pathname === "/";

  // Initialize Audio Object
  useEffect(() => {
    const audio = new Audio(SONG_PATH);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Stop audio immediately whenever the user navigates away from the main invitation page
  useEffect(() => {
    if (!isInvitationPage && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [pathname, isInvitationPage]);

  // Handler to start music and open invitation
  const handleOpenInvitation = useCallback(() => {
    setHasOpened(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch((err) => console.log("Playback blocked:", err));
    }
  }, []);

  // Bottom Floating Button Toggle Function
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch((err) => console.log("Playback error:", err));
    }
  };

  // If the user is on /dashboard or any other route, do not display the music components
  if (!isInvitationPage) return null;

  return (
    <>
      <style>{`
        @keyframes music-wave {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1.1); }
        }
        .music-bar {
          display: inline-block;
          width: 3px;
          height: 14px;
          border-radius: 2px;
          background: currentColor;
          transform-origin: bottom;
          animation: music-wave 0.9s ease-in-out infinite;
        }
        .music-bar:nth-child(1) { animation-delay: 0s; }
        .music-bar:nth-child(2) { animation-delay: 0.15s; }
        .music-bar:nth-child(3) { animation-delay: 0.3s; }
        .music-bar:nth-child(4) { animation-delay: 0.45s; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(226,161,63,0.35); }
          50%       { box-shadow: 0 4px 30px rgba(226,161,63,0.65); }
        }
        .music-btn-playing {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .overlay-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease;
        }

        .open-card-btn {
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          color: #2c2c2c;
          font-family: inherit;
          font-size: 1.1rem;
          font-weight: 700;
          padding: 1rem 2.2rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(253, 160, 133, 0.5);
          transition: transform 0.2s ease;
        }
        .open-card-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      {/* 1. First-Load Overlay to ensure autoplay compliance */}
      {!hasOpened && (
        <div className="overlay-backdrop">
          <button className="open-card-btn" onClick={handleOpenInvitation}>
            💌 Tap to Open Invitation 🎵
          </button>
        </div>
      )}

      {/* 2. Floating Toggle Button (Visible only on the invitation page) */}
      <button
        id="music-player-btn"
        onClick={toggleMusic}
        title={playing ? "Pause music" : "Play music"}
        aria-label={playing ? "Pause background music" : "Play background music"}
        style={{
          position: "fixed",
          bottom: "1.4rem",
          right: "1.4rem",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "1.5px solid rgba(226,161,63,0.4)",
          background: playing
            ? "linear-gradient(135deg, var(--honey, #f6d365), #d4882a)"
            : "var(--paper, #ffffff)",
          color: playing ? "var(--ink, #2c2c2c)" : "var(--ink-soft, #666666)",
          fontFamily: "'Figtree', sans-serif",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(12px)",
        }}
        className={playing ? "music-btn-playing" : ""}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={playing ? "var(--ink, #2c2c2c)" : "var(--ink-soft, #666666)"}
          style={{ flexShrink: 0 }}
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>

        {playing ? (
          <span style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "16px" }}>
            <span className="music-bar" />
            <span className="music-bar" />
            <span className="music-bar" />
            <span className="music-bar" />
          </span>
        ) : (
          <span style={{ fontSize: "0.78rem" }}>Play Music</span>
        )}
      </button>
    </>
  );
}