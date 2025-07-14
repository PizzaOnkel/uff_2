import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

const rankOrder = [
  "Clanführer",
  "Vorgesetzter",
  "Chest_Counter",
  "Clan_Bank",
  "Clan_Taxi",
  "Offizier",
  "Veteran",
  "Soldat"
];

export default function ManagePlayersPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    rank: "",
    troopStrength: ""
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    aliases: "",
    rank: "",
    troopStrength: ""
  });

  // Spieler laden und sortieren
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "players"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      list.sort((a, b) => {
        const rankA = rankOrder.indexOf(a.rank);
        const rankB = rankOrder.indexOf(b.rank);
        if (rankA !== rankB) return rankA - rankB;
        if (["Vorgesetzter", "Offizier", "Veteran", "Soldat"].includes(a.rank)) {
          return Number(b.troopStrength) - Number(a.troopStrength);
        }
        return 0;
      });

      setPlayers(list);
    });
    return () => unsub();
  }, []);

  // Ränge laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ranks"), (snapshot) => {
      setRanks(snapshot.docs.map(doc => doc.data().name));
    });
    return () => unsub();
  }, []);

  // Truppenstärken laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "troopStrengths"), (snapshot) => {
      setTroopStrengths(snapshot.docs.map(doc => ({
        name: doc.data().name,
        norm: doc.data().norm // z.B. { chests: 10, points: 100 }
      })));
    });
    return () => unsub();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Spieler zu Firestore hinzufügen
  const handleAddPlayer = async () => {
    if (!form.name || !form.rank || !form.troopStrength) return;

    // Normen aus der gewählten Truppenstärke holen
    const selectedTroop = troopStrengths.find(ts => ts.name === form.troopStrength);
    const playerNorms = selectedTroop?.norm || {};

    const newPlayer = {
      name: form.name,
      aliases: form.aliases.split(",").map(a => a.trim()).filter(a => a),
      rank: form.rank,
      troopStrength: form.troopStrength,
      norms: playerNorms
    };
    await addDoc(collection(db, "players"), newPlayer);
    setForm({
      name: "",
      aliases: "",
      rank: "",
      troopStrength: ""
    });
  };

  // Spieler bearbeiten
  const handleEditClick = (player) => {
    setEditId(player.id);
    setEditForm({
      name: player.name,
      aliases: player.aliases ? player.aliases.join(", ") : "",
      rank: player.rank,
      troopStrength: player.troopStrength
    });
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdatePlayer = async () => {
    if (!editForm.name || !editForm.rank || !editForm.troopStrength) return;

    // Normen aus der gewählten Truppenstärke holen
    const selectedTroop = troopStrengths.find(ts => ts.name === editForm.troopStrength);
    const playerNorms = selectedTroop?.norm || {};

    await updateDoc(doc(db, "players", editId), {
      name: editForm.name,
      aliases: editForm.aliases.split(",").map(a => a.trim()).filter(a => a),
      rank: editForm.rank,
      troopStrength: editForm.troopStrength,
      norms: playerNorms
    });
    setEditId(null);
    setEditForm({
      name: "",
      aliases: "",
      rank: "",
      troopStrength: ""
    });
  };

  // Spieler löschen
  const handleDeletePlayer = async (id) => {
    await deleteDoc(doc(db, "players", id));
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
        <select
          name="rank"
          value={form.rank}
          onChange={handleChange}
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        >
          <option value="">Rang auswählen</option>
          {ranks.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
        <select
          name="troopStrength"
          value={form.troopStrength}
          onChange={handleChange}
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        >
          <option value="">Truppenstärke auswählen</option>
          {troopStrengths.map(strength => (
            <option key={strength.name} value={strength.name}>
              {strength.name}
            </option>
          ))}
        </select>
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
            {editId === player.id ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="mb-2 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
                />
                <input
                  type="text"
                  name="aliases"
                  value={editForm.aliases}
                  onChange={handleEditChange}
                  className="mb-2 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
                />
                <select
                  name="rank"
                  value={editForm.rank}
                  onChange={handleEditChange}
                  className="mb-2 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
                >
                  <option value="">Rang auswählen</option>
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
                <select
                  name="troopStrength"
                  value={editForm.troopStrength}
                  onChange={handleEditChange}
                  className="mb-2 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
                >
                  <option value="">Truppenstärke auswählen</option>
                  {troopStrengths.map(strength => (
                    <option key={strength.name} value={strength.name}>
                      {strength.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdatePlayer}
                  className="px-4 py-2 bg-green-600 rounded text-white font-semibold hover:bg-green-700 transition mb-2"
                >
                  Änderungen speichern
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 bg-gray-600 rounded text-white font-semibold hover:bg-gray-700 transition"
                >
                  Abbrechen
                </button>
              </>
            ) : (
              <>
                <span><b>Name:</b> {player.name}</span>
                <span><b>Aliase:</b> {player.aliases && player.aliases.join(", ")}</span>
                <span><b>Rang:</b> {player.rank}</span>
                <span><b>Truppenstärke:</b> {player.troopStrength}</span>
                <span><b>Normen:</b> Truhen: {player.norms?.chests}, Punkte: {player.norms?.points}</span>
                <span><b>ID:</b> {player.id}</span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditClick(player)}
                    className="px-3 py-1 bg-yellow-600 rounded text-white hover:bg-yellow-700"
                  >
                    Spieler bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
                  >
                    Spieler löschen
                  </button>
                </div>
              </>
            )}
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