import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function ManagePlayersPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    rank: "",
    troopStrength: "",
    chestsNorm: "",
    pointsNorm: ""
  });

  // Firestore: Spieler automatisch laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "players"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(list);
    });
    return () => unsub();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Spieler zu Firestore hinzufügen
  const handleAddPlayer = async () => {
    if (!form.name) return;
    const newPlayer = {
      name: form.name,
      aliases: form.aliases.split(",").map(a => a.trim()).filter(a => a),
      rank: form.rank,
      troopStrength: form.troopStrength,
      norms: {
        chests: Number(form.chestsNorm),
        points: Number(form.pointsNorm)
      }
    };
    await addDoc(collection(db, "players"), newPlayer);
    setForm({
      name: "",
      aliases: "",
      rank: "",
      troopStrength: "",
      chestsNorm: "",
      pointsNorm: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{t.managePlayersTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Spielername"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="text"
          name="aliases"
          value={form.aliases}
          onChange={handleChange}
          placeholder="Aliase (Komma getrennt)"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="text"
          name="rank"
          value={form.rank}
          onChange={handleChange}
          placeholder="Rang"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="text"
          name="troopStrength"
          value={form.troopStrength}
          onChange={handleChange}
          placeholder="Truppenstärke"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="number"
          name="chestsNorm"
          value={form.chestsNorm}
          onChange={handleChange}
          placeholder="Norm Clantruhen"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="number"
          name="pointsNorm"
          value={form.pointsNorm}
          onChange={handleChange}
          placeholder="Norm Punkte"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <button
          onClick={handleAddPlayer}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition w-full"
        >
          Spieler hinzufügen
        </button>
      </div>
      <ul className="w-full max-w-xl">
        {players.map(player => (
          <li key={player.id} className="flex flex-col bg-gray-800 rounded p-2 mb-2">
            <span><b>Name:</b> {player.name}</span>
            <span><b>Aliase:</b> {player.aliases.join(", ")}</span>
            <span><b>Rang:</b> {player.rank}</span>
            <span><b>Truppenstärke:</b> {player.troopStrength}</span>
            <span><b>Normen:</b> Truhen: {player.norms.chests}, Punkte: {player.norms.points}</span>
            <span><b>ID:</b> {player.id}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setCurrentPage("adminPanel")}
        className="mt-8 text-blue-300 underline"
      >
        Zurück zum Admin-Panel
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}