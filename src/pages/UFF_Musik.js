
import React, { useRef, useState } from "react";
import StickyBackButton from "../components/StickyBackButton";
import { ROUTES } from "../routes";

const initialSongs = [
  { title: "Union for Friends 1", src: "/musik/Union for Friends 1.mp3", hymn: "UFF-Hymn 1" },
  { title: "Union For Friends engl 001", src: "/musik/Union For Friends_engl_001.mp3", hymn: "UFF-Hymn 2" },
  { title: "Union For Friends engl 002", src: "/musik/Union For Friends_engl_002.mp3", hymn: "UFF Hymn 3" }
];

export default function UFF_Musik({ t, setCurrentPage }) {
  const [songs, setSongs] = useState(initialSongs.map(song => ({ ...song, likes: 0, dislikes: 0 })));
  const [playingIdx, setPlayingIdx] = useState(null);
  const audioRefs = useRef([]);

  const handlePlay = idx => {
    if (audioRefs.current[idx]) {
      audioRefs.current.forEach((audio, i) => {
        if (audio && i !== idx) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRefs.current[idx].play();
      setPlayingIdx(idx);
    }
  };
  const handleStop = idx => {
    if (audioRefs.current[idx]) {
      audioRefs.current[idx].pause();
      audioRefs.current[idx].currentTime = 0;
      setPlayingIdx(null);
    }
  };
  const handleLike = idx => {
    setSongs(songs => songs.map((s, i) => i === idx ? { ...s, likes: s.likes + 1 } : s));
  };
  const handleDislike = idx => {
    setSongs(songs => songs.map((s, i) => i === idx ? { ...s, dislikes: s.dislikes + 1 } : s));
  };

  // Für die grafische Auswertung
  const maxVotes = Math.max(...songs.map(s => s.likes + s.dislikes), 1);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <div style={{position:'fixed', right:'24px', top:'50%', transform:'translateY(200%)', zIndex:1000, width:'200px', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto'}}>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => setCurrentPage(ROUTES.NAVIGATION)} label={t?.backToNavigation || "Zurück"} style={{width:'100px'}} />
        </div>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => window.scrollTo({top:0, behavior:'smooth'})} label={"On Top"} style={{ background: '#1976d2', width:'100px', marginTop:'34px' }} />
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">UFF Musik</h2>
        <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-2 text-blue-300">Hört euch diese Songs an und stimmt ab!</h3>
          <table className="w-full text-center mb-6">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">UFF-Hymne</th>
                <th className="p-2">Titel (MP3)</th>
                <th className="p-2">Play</th>
                <th className="p-2">Stop</th>
                <th className="p-2">Like</th>
                <th className="p-2">Dislike</th>
                <th className="p-2">Likes</th>
                <th className="p-2">Dislikes</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, idx) => (
                <tr key={idx}>
                  <td className="p-2">{song.hymn}</td>
                  <td className="p-2">{song.title}</td>
                  <td className="p-2">
                    <audio ref={el => audioRefs.current[idx] = el} src={song.src} onEnded={() => setPlayingIdx(null)} />
                    <button onClick={() => handlePlay(idx)} disabled={playingIdx === idx} style={{marginRight:8}}>▶️</button>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleStop(idx)} disabled={playingIdx !== idx}>⏹️</button>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleLike(idx)} style={{marginRight:8}}>👍</button>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleDislike(idx)} style={{marginRight:8}}>👎</button>
                  </td>
                  <td className="p-2">{song.likes}</td>
                  <td className="p-2">{song.dislikes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Grafische Auswertung */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "32px", height: "140px", marginTop: "24px", width: "100%", justifyContent: "center" }}>
            {songs.map((song, idx) => (
              <div key={idx} style={{ textAlign: "center", width: "60px" }}>
                <div style={{
                  background: "#1976d2",
                  width: "40px",
                  height: `${(song.likes / maxVotes) * 100}px`,
                  borderRadius: "8px 8px 0 0",
                  transition: "height 0.5s"
                }} />
                <div style={{
                  background: "#d32f2f",
                  width: "40px",
                  height: `${(song.dislikes / maxVotes) * 100}px`,
                  borderRadius: "0 0 8px 8px",
                  marginTop: "2px",
                  transition: "height 0.5s"
                }} />
                <div style={{ marginTop: "8px", fontWeight: "bold", color: "#fff" }}>{song.likes} / {song.dislikes}</div>
                <div style={{ fontSize: "0.9em", color: "#ccc" }}>{song.hymn}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">{t?.copyright}</footer>
    </div>
  );
}
