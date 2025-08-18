import React, { useState, useEffect } from "react";
import StickyBackButton from "../components/StickyBackButton";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDocs } from "firebase/firestore";

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
  const [currentCategoryIdx] = useState(0); // Dummy für On Top Button, falls benötigt
  // Fallback für t, falls nicht übergeben
  const translations = {
    managePlayersTitle: 'Spieler verwalten',
    // ...weitere Defaults nach Bedarf
  };
  t = t || translations;
  const [players, setPlayers] = useState([]);

  // CSS für Markierung dynamisch einfügen (nur einmal)
  React.useEffect(() => {
    if (!document.getElementById('selected-player-link-style')) {
      const style = document.createElement('style');
      style.id = 'selected-player-link-style';
      style.innerHTML = `
        .selected-player-link {
          outline: 3px solid #FFD700 !important;
          box-shadow: 0 0 0 4px #fff70055 !important;
          background: #b45309 !important;
          transition: background 0.2s, outline 0.2s;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // --- Suchfeld States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = React.useRef(null);

  const [missingClanmates, setMissingClanmates] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [norms, setNorms] = useState([]);
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    rank: "",
    troopStrength: ""
  });
  const [addError, setAddError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    aliases: "",
    rank: "",
    troopStrength: ""
  });

  // --- Hilfsfunktion: unscharfe Suche ---
  function fuzzyMatchPlayers(term) {
    if (!term) return [];
    const lower = term.toLowerCase();
    const allNames = players.map(p => p.name);
    // 1. Exakte Übereinstimmung
    if (allNames.includes(term)) return [term];
    // 2. Enthält oder unscharf
    return allNames.filter(name => name.toLowerCase().includes(lower));
  }

  // --- Suche ausführen ---
  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchTerm) return;
    const matches = fuzzyMatchPlayers(searchTerm);
    if (matches.length === 1) {
      scrollToPlayer(matches[0]);
      setShowDropdown(false);
    } else if (matches.length > 1) {
      setSearchResults(matches);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }

  // --- Zu Spieler scrollen ---
  function scrollToPlayer(playerName) {
    setShowDropdown(false);
    setSearchTerm("");
    setTimeout(() => {
      const el = document.querySelector(`[data-player-name="${playerName}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-podium');
        el.classList.add('selected-player-link');
        setTimeout(() => {
          el.classList.remove('highlight-podium');
          el.classList.remove('selected-player-link');
        }, 2000);
      }
    }, 250);
  }

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

  // Suche Clanmates aus results, die nicht in players stehen
  useEffect(() => {
    async function findMissingClanmates() {
      const playersSnap = await getDocs(collection(db, "players"));
      const playerNames = playersSnap.docs.map(doc => doc.data().name);
      const playerAliases = playersSnap.docs
        .map(doc => {
          const aliasesRaw = doc.data().aliases;
          let aliasesStr = '';
          if (Array.isArray(aliasesRaw)) {
            aliasesStr = aliasesRaw.join(",");
          } else if (typeof aliasesRaw === 'string') {
            aliasesStr = aliasesRaw;
          } else {
            aliasesStr = '';
          }
          return aliasesStr.split(",").map(a => a.trim()).filter(a => a);
        })
        .flat();
      const allKnownNames = new Set([...playerNames, ...playerAliases]);
      const resultsSnap = await getDocs(collection(db, "results"));
      const allClanmates = new Set();
      resultsSnap.forEach(doc => {
        const data = doc.data();
        if (data.Clanmate) allClanmates.add(data.Clanmate);
        if (data.name) allClanmates.add(data.name);
        if (data.player) allClanmates.add(data.player);
      });
      const missing = Array.from(allClanmates).filter(name => name && !allKnownNames.has(name));
      setMissingClanmates(missing);
    }
    findMissingClanmates();
  }, [players]);

  // Ränge laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ranks"), (snapshot) => {
      setRanks(snapshot.docs.map(doc => doc.data().name));
    });
    return () => unsub();
  }, []);


  // Normen laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "norms"), (snapshot) => {
      setNorms(snapshot.docs.map(doc => ({
        troopStrength: doc.data().troopStrength,
        value: doc.data().value
      })));
    });
    return () => unsub();
  }, []);

  // Truppenstärken laden und mit Normen verknüpfen
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "troopStrengths"), (snapshot) => {
      setTroopStrengths(snapshot.docs.map(doc => {
        const name = doc.data().name;
        // Passende Norm suchen
        const normObj = norms.find(n => n.troopStrength === name);
        return {
          name,
          norm: normObj ? { points: normObj.value } : {} // Nur Punkte, weitere Felder nach Bedarf
        };
      }));
    });
    return () => unsub();
  }, [norms]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Spieler zu Firestore hinzufügen
  const handleAddPlayer = async () => {
    setAddError("");
    if (!form.name || !form.rank || !form.troopStrength) {
      setAddError("Bitte alle Pflichtfelder ausfüllen (Name, Rang, Truppenstärke).");
      return;
    }

    // Prüfe auf Namens- oder Alias-Kollision
    const lowerName = form.name.trim().toLowerCase();
    const newAliases = form.aliases.split(",").map(a => a.trim().toLowerCase()).filter(a => a);
    const allNames = players.map(p => p.name.toLowerCase());
    const allAliases = players.flatMap(p => (p.aliases || []).map(a => a.toLowerCase()));
    const conflict = allNames.includes(lowerName) || allAliases.includes(lowerName) || newAliases.some(a => allNames.includes(a) || allAliases.includes(a));
    if (conflict) {
      const proceed = window.confirm("Achtung: Ein Spieler mit diesem Namen oder Alias existiert bereits. Trotzdem anlegen?");
      if (!proceed) return;
    }

    // Normen aus der gewählten Truppenstärke holen (inkl. Punkte aus norms)
    const selectedTroop = troopStrengths.find(ts => ts.name === form.troopStrength);
    const playerNorms = selectedTroop?.norm || {};

    const newPlayer = {
      name: form.name,
      aliases: form.aliases.split(",").map(a => a.trim()).filter(a => a),
      rank: form.rank,
      troopStrength: form.troopStrength,
      norms: playerNorms
    };
    try {
      await addDoc(collection(db, "players"), newPlayer);
      setForm({
        name: "",
        aliases: "",
        rank: "",
        troopStrength: ""
      });
    } catch (err) {
      setAddError("Fehler beim Anlegen des Spielers: " + (err.message || err.code || err.toString()));
    }
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


    // Normen aus der gewählten Truppenstärke holen (inkl. Punkte aus norms)
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-4 pb-8 relative">
      {/* Fixierte Buttons rechts mittig */}
      <div style={{position:'fixed', right:'24px', top:'50%', transform:'translateY(-50%)', zIndex:1000, width:'200px', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto'}}>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => setCurrentPage("adminPanel")} label={t?.backToNavigation || 'Zurück'} style={{width:'100px'}} />
        </div>
        <div style={{width:'100%'}}>
          <StickyBackButton
            onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            label={"On Top"}
            style={{ background: '#1976d2', width:'100px', marginTop:'34px' }}
          />
        </div>
        {/* Suchfeld für Spieler */}
        <div style={{ height: 155 }} />
        <form onSubmit={handleSearchSubmit} style={{width:'100%', marginTop: 0, display:'flex', flexDirection:'column', alignItems:'center'}} autoComplete="off">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Spieler suchen..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setShowDropdown(false); }}
            style={{ width:'100%', padding:'8px', borderRadius:8, border:'1px solid #888', marginBottom: showDropdown ? 0 : 12, fontSize:16, background:'#222', color:'#fff' }}
            onFocus={() => searchTerm && setShowDropdown(true)}
          />
          {showDropdown && searchResults.length > 0 && (
            <div style={{width:'100%', background:'#222', border:'1px solid #888', borderRadius:8, maxHeight:180, overflowY:'auto', marginBottom:12, zIndex:2000}}>
              {searchResults.map(name => (
                <div key={name} style={{padding:'8px 12px', cursor:'pointer', color:'#FFD700'}}
                  onClick={() => scrollToPlayer(name)}
                  onMouseDown={e => e.preventDefault()}
                >{name}</div>
              ))}
            </div>
          )}
        </form>
      </div>
      {/* Button oben rechts entfernt */}
      <div className="flex w-full max-w-7xl mx-auto">
        {/* Fehlende Clanmates links */}
        {missingClanmates.length > 0 && (
          <div className="bg-yellow-900 text-yellow-200 rounded-lg p-4 mb-6 mr-8 w-80 self-start">
            <div className="font-bold mb-2">Clanmates in Ergebnissen, aber nicht in der Spieler-Liste:</div>
            <ul className="list-disc pl-6">
              {missingClanmates.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-2 text-center text-blue-400">{t.managePlayersTitle}</h2>
          <div className="mb-6 text-center text-lg text-gray-300 font-semibold">
            Anzahl Spieler in der Datenbank: <span className="text-yellow-300">{players.length}</span>
          </div>
          <div className="mb-6 w-full max-w-xl flex flex-col gap-1">
            {addError && <div style={{color:'#ff6666', fontWeight:'bold', marginBottom:8}}>{addError}</div>}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Spielername"
              className="mb-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full text-sm"
              style={{ minHeight: 28 }}
            />
            <input
              type="text"
              name="aliases"
              value={form.aliases}
              onChange={handleChange}
              placeholder="Aliase (Komma getrennt)"
              className="mb-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full text-sm"
              style={{ minHeight: 28 }}
            />
            <select
              name="rank"
              value={form.rank}
              onChange={handleChange}
              className="mb-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full text-sm"
              style={{ minHeight: 28 }}
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
              className="mb-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full text-sm"
              style={{ minHeight: 28 }}
            >
              <option value="">Truppenstärke auswählen</option>
              {troopStrengths.map(strength => (
                <option key={strength.name} value={strength.name}>{strength.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddPlayer}
              className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!form.name || !form.rank || !form.troopStrength}
              type="button"
            >
              Speichern
            </button>
          <ul className="w-full max-w-xl">
            {players.map(player => (
              <li key={player.id} data-player-name={player.name} className="flex flex-row items-center justify-between bg-gray-800 rounded px-2 py-1 mb-1 text-sm player-list-item">
                {editId === player.id ? (
                  <div className="w-full flex flex-col gap-1">
                    {/* ...bestehende Edit-Inputs... */}
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 w-full text-sm"
                      style={{ minHeight: 24 }}
                    />
                    <input
                      type="text"
                      name="aliases"
                      value={editForm.aliases}
                      onChange={handleEditChange}
                      className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 w-full text-sm"
                      style={{ minHeight: 24 }}
                    />
                    <select
                      name="rank"
                      value={editForm.rank}
                      onChange={handleEditChange}
                      className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 w-full text-sm"
                      style={{ minHeight: 24 }}
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
                      className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 w-full text-sm"
                      style={{ minHeight: 24 }}
                    >
                      <option value="">Truppenstärke auswählen</option>
                      {troopStrengths.map(strength => (
                        <option key={strength.name} value={strength.name}>
                          {strength.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={handleUpdatePlayer}
                        className="px-2 py-1 bg-green-600 rounded text-white font-semibold hover:bg-green-700 transition text-xs"
                        style={{ minWidth: 0, minHeight: 24 }}
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="px-2 py-1 bg-gray-600 rounded text-white font-semibold hover:bg-gray-700 transition text-xs"
                        style={{ minWidth: 0, minHeight: 24 }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#FFD700', fontSize: '1em' }}
                      onClick={() => handleEditClick(player)}
                      title="Zum Bearbeiten klicken"
                    >
                      {player.name}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(player)}
                        className="px-2 py-1 bg-yellow-600 rounded text-white hover:bg-yellow-700 text-xs"
                        style={{ minWidth: 0, minHeight: 24 }}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="px-2 py-1 bg-red-600 rounded text-white hover:bg-red-700 text-xs"
                        style={{ minWidth: 0, minHeight: 24 }}
                      >
                        Löschen
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Feste Tabelle oben rechts für Spieler mit nicht definiertem Rang/Truppenstärke */}
        {players.filter(p => (String(p.rank).toLowerCase().includes('nicht definiert') || String(p.troopStrength).toLowerCase().includes('nicht definiert'))).length > 0 && (
          <div style={{position:'fixed', top:24, right:24, zIndex:2001, width:'340px', maxHeight:'40vh', overflowY:'auto', background:'#7f1d1d', color:'#fff', borderRadius:'12px', boxShadow:'0 2px 12px #0008', padding:'18px 16px 60px 16px', border:'2px solid #b91c1c', boxSizing:'border-box'}}>
            <div style={{fontWeight:'bold', marginBottom:8, color:'#fca5a5', fontSize:'1.1em'}}>Spieler mit "nicht definiert" in Rang/Truppenstärke:</div>
            <table style={{width:'100%', fontSize:'0.98em'}}>
              <thead>
                <tr style={{color:'#f87171'}}>
                  <th style={{textAlign:'left'}}>Name</th>
                  <th style={{textAlign:'left'}}>Rang</th>
                  <th style={{textAlign:'left'}}>Truppenstärke</th>
                </tr>
              </thead>
              <tbody>
                {players.filter(p => (String(p.rank).toLowerCase().includes('nicht definiert') || String(p.troopStrength).toLowerCase().includes('nicht definiert'))).map(p => (
                  <tr key={p.id} style={{borderBottom:'1px solid #991b1b'}}>
                    <td>
                      <span
                        style={{color:'#fff', textDecoration:'underline', cursor:'pointer', fontWeight:'bold'}}
                        onClick={() => scrollToPlayer(p.name)}
                        title="Zu diesem Spieler scrollen und markieren"
                      >
                        {p.name}
                      </span>
                    </td>
                    <td>{p.rank || <span style={{fontStyle:'italic', color:'#bbb'}}>-</span>}</td>
                    <td>{p.troopStrength || <span style={{fontStyle:'italic', color:'#bbb'}}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Ende flex-Container */}
      </div>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
