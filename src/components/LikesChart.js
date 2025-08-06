import React from "react";


export default function LikesChart({ songs }) {
  // Fallback falls songs nicht gesetzt ist
  const safeSongs = Array.isArray(songs) ? songs : [];
  const maxLikes = Math.max(...safeSongs.map(s => s.likes), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "24px", height: "120px", marginTop: "24px" }}>
      {safeSongs.map((song, idx) => (
        <div key={idx} style={{ textAlign: "center" }}>
          <div style={{
            background: "#1976d2",
            width: "40px",
            height: `${(song.likes / maxLikes) * 100}px`,
            borderRadius: "8px 8px 0 0",
            transition: "height 0.5s"
          }} />
          <div style={{ marginTop: "8px", fontWeight: "bold", color: "#fff" }}>{song.likes}</div>
          <div style={{ fontSize: "0.9em", color: "#ccc" }}>{song.label}</div>
        </div>
      ))}
    </div>
  );
}
