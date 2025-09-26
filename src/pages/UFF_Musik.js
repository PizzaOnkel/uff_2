
import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import StickyBackButton from "../components/StickyBackButton";
import { ROUTES } from "../routes";

const initialSongs = [
  { title: "Union_for_Friends_1", src: process.env.PUBLIC_URL + "/musik/Union_for_Friends_1.mp3", hymn: "UFF-Hymn 1" },
  { title: "Union_For_Friends_engl_001", src: process.env.PUBLIC_URL + "/musik/Union_For_Friends_engl_001.mp3", hymn: "UFF-Hymn 2" },
  { title: "Union_For_Friends_engl_002", src: process.env.PUBLIC_URL + "/musik/Union_For_Friends_engl_002.mp3", hymn: "UFF Hymn 3" }
];

function getAudioSrc(src) {
  // Versuche Original, dann /audio/, dann Root
  if (window && window.location) {
    // Die Datei wird im Browser geladen, also ist window verfügbar
    return [src, src.replace("/musik/", "/audio/"), src.replace("/musik/", "/")];
  }
  return [src];
}

export default function UFF_Musik({ t, setCurrentPage }) {
  const [songs, setSongs] = useState(initialSongs.map(song => ({ ...song, likes: 0, dislikes: 0 })));
  const [playingIdx, setPlayingIdx] = useState(null);
  const [audioErrorIdx, setAudioErrorIdx] = useState(null);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const audioRefs = useRef([]);

  // Votes aus Firestore laden
  useEffect(() => {
    async function fetchVotes() {
      setLoadingVotes(true);
      const snap = await getDocs(collection(db, "uff_songs"));
      const votes = {};
      snap.forEach(doc => {
        votes[doc.id] = doc.data();
      });
      setSongs(songs => songs.map(song => {
        const v = votes[song.title];
        return v ? { ...song, likes: v.likes || 0, dislikes: v.dislikes || 0 } : song;
      }));
      setLoadingVotes(false);
    }
    fetchVotes();
  }, []);

  const handlePlay = idx => {
    if (audioRefs.current[idx]) {
      audioRefs.current.forEach((audio, i) => {
        if (audio && i !== idx) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setAudioErrorIdx(null);
      audioRefs.current[idx].play();
      setPlayingIdx(idx);
    }
  };
  const handleStop = idx => {
    if (audioRefs.current[idx]) {
      audioRefs.current[idx].pause();
      audioRefs.current[idx].currentTime = 0;
      setPlayingIdx(null);
      setAudioErrorIdx(null);
    }
  };
  async function reloadVotes() {
    setLoadingVotes(true);
    const snap = await getDocs(collection(db, "uff_songs"));
    const votes = {};
    snap.forEach(doc => {
      votes[doc.id] = doc.data();
    });
    setSongs(songs => songs.map(song => {
      const v = votes[song.title];
      return v ? { ...song, likes: v.likes || 0, dislikes: v.dislikes || 0 } : song;
    }));
    setLoadingVotes(false);
  }

  const handleLike = async idx => {
    const song = songs[idx];
    const newLikes = song.likes + 1;
    const ref = doc(db, "uff_songs", song.title);
    await setDoc(ref, { likes: newLikes, dislikes: song.dislikes }, { merge: true });
    await reloadVotes();
  };
  const handleDislike = async idx => {
    const song = songs[idx];
    const newDislikes = song.dislikes + 1;
    const ref = doc(db, "uff_songs", song.title);
    await setDoc(ref, { likes: song.likes, dislikes: newDislikes }, { merge: true });
    await reloadVotes();
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
          {loadingVotes && <div className="text-lg text-blue-200 mb-4">Lade Abstimmungen...</div>}
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
                <tr key={idx} style={playingIdx === idx ? { background: '#1976d2', color: '#fff', fontWeight: 'bold' } : {}}>
                  <td className="p-2">{song.hymn}</td>
                  <td className="p-2">{song.title}</td>
                  <td className="p-2">
                    {/* Versuche verschiedene Pfade, nimm den ersten, der funktioniert */}
                    <audio
                      ref={el => audioRefs.current[idx] = el}
                      src={getAudioSrc(song.src)[0]}
                      onEnded={() => setPlayingIdx(null)}
                      onError={() => {
                        // Versuche Fallbacks
                        const fallbacks = getAudioSrc(song.src);
                        let found = false;
                        for (let i = 1; i < fallbacks.length; i++) {
                          const testAudio = document.createElement('audio');
                          testAudio.src = fallbacks[i];
                          testAudio.oncanplaythrough = () => {
                            audioRefs.current[idx].src = fallbacks[i];
                            audioRefs.current[idx].play();
                            setAudioErrorIdx(null);
                          };
                          testAudio.onerror = () => {};
                          testAudio.load();
                        }
                        setAudioErrorIdx(idx);
                      }}
                    />
                    <button onClick={() => handlePlay(idx)} disabled={playingIdx === idx} style={{marginRight:8}}>▶️</button>
                    {playingIdx === idx && <span style={{marginLeft:8, color:'#fff', fontWeight:'bold'}}>Wird abgespielt…</span>}
                    {audioErrorIdx === idx && <span style={{marginLeft:8, color:'#ff6666', fontWeight:'bold'}}>Datei nicht gefunden!</span>}
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

          {/* Button zum Shop */}
          <div className="w-full flex justify-center mt-8">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg text-xl transform transition-all hover:scale-105"
              onClick={() => setCurrentPage && setCurrentPage("musikShop")}
            >
              🎵 weitere Musik-Projekte
            </button>
          </div>
        </div>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">{t?.copyright}</footer>
    </div>
  );
}
