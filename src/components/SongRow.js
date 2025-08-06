import React, { useState, useRef } from "react";

export default function SongRow({ song, label, likes, onLike }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <tr>
      <td>{label}</td>
      <td>
        <audio ref={audioRef} src={song} onEnded={handleEnded} />
        <button onClick={handlePlay} disabled={isPlaying} style={{marginRight:8}}>Play</button>
        <button onClick={handleStop} disabled={!isPlaying}>Stop</button>
      </td>
      <td>
        <button onClick={onLike} style={{marginRight:8}}>👍</button>
        <span>{likes}</span>
      </td>
    </tr>
  );
}
