// Alle zuordenbaren Kategorien:
// Arena, Common, Rare, Epic, Tartaros, Elven, Cursed, Bank, Runic, Heroic, Vota, Quick March, Ancients, ROTA, Epic Ancient, Union, Jormungandr

// Alle zuordenbaren Type:
// (aus CHEST_TYPES)
// "default", "Wooden", "Bronze", "Silver", "Golden", "Precious", "Magic", ...

// Alle zuordenbaren Source:
// (aus CHEST_SOURCES)
// "default", "Event", "Shop", "Quest", "Drop", "Common", ...


import React, { useState, useEffect } from "react";
import { CHEST_NAMES, CHEST_TYPES, CHEST_SOURCES } from "./chestDropdownData";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs, query } from "firebase/firestore";

function ManageChestMappingPage({ t, setCurrentPage }) {
  // Sortier-Optionen für Vorschlagsliste
  const [sortField, setSortField] = useState('category'); // 'category' oder 'chestName' oder 'level'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' oder 'desc'
  const [chestMappings, setChestMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({
    chestName: "default",
    category: "",
    type: "",
    source: "",
    levelStart: "",
    levelEnd: "",
    points: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMapping, setEditingMapping] = useState({});
  const [usedChestMappings, setUsedChestMappings] = useState([]);
  const [importing, setImporting] = useState(false);
  const categories = [
    "Arena", "Common", "Rare", "Epic", "Tartaros",
    "Elven", "Cursed", "Bank", "Runic", "Heroic",
    "Vota", "Quick March", "Ancients", "ROTA", "Epic Ancient",
    "Union", "Jormungandr"
  ];
  useEffect(() => {
    // chestMappings abonnieren
    const unsub1 = onSnapshot(collection(db, "chestMappings"), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setChestMappings(list);
    });
    // usedChestMappings abonnieren (Vorschläge immer aktuell!)
    const unsub2 = onSnapshot(collection(db, "usedChestMappings"), snapshot => {
      setUsedChestMappings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);
  // Importiere einen Mapping-Vorschlag in die chestMappings
  async function importUsedMapping(mapping) {
    setImporting(true);
    try {
      await addDoc(collection(db, "chestMappings"), {
        chestName: mapping.chestName,
        category: mapping.category,
        levelStart: mapping.level,
        levelEnd: mapping.level,
        points: 0,
        timestamp: new Date().toISOString()
      });
      // Optional: Nach dem Import aus der Vorschlagsliste entfernen
      setUsedChestMappings(usedChestMappings.filter(m => m.id !== mapping.id));
    } catch (e) {
      alert("Fehler beim Importieren: " + e.message);
    }
    setImporting(false);
  }

  const chestNames = {
    "Arena Chests": ["default"],
    "Common Chests": ["default"],
    "Rare Chests": ["default"],
    "Epic Chests": ["default"],
    "Chests of Tartaros": ["default"],
    "Elven Chests": ["default", "Elven Citadel Chest"],
    "Cursed Chests": ["default", "Cursed Citadel Chest"],
    "Runic Chests": ["default"],
    "Heroic Chests": ["default"],
    "Vault of the Ancients": ["default"],
    "Bank Chests": [
      "Wooden Chest",
      "Bronze Chest",
      "Silver Chest",
      "Golden Chest",
      "Precious Chest",
      "Magic Chest"
    ]
    // ...weitere Chests ggf. ergänzen...
  };

  function getChestNamesForCategory(category) {
    const bankNames = ["Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest"];
    if (category === "Bank") {
      return [...bankNames];
    }
    return chestNames[category + " Chests"] || chestNames[category] || ["default"];
  }

  const handleAddMapping = async (e) => {
    e.preventDefault();
    if (!newMapping.category || !newMapping.points) return;
    let levelStart = newMapping.levelStart;
    let levelEnd = newMapping.levelEnd;
    // Für Banktruhen als String speichern, sonst als Zahl
    if (newMapping.category !== "Bank") {
      levelStart = levelStart !== "" ? parseInt(levelStart, 10) : "";
      levelEnd = levelEnd !== "" ? parseInt(levelEnd, 10) : "";
    }
    const docRef = await addDoc(collection(db, "chestMappings"), {
      ...newMapping,
      levelStart,
      levelEnd,
      points: newMapping.points !== "" ? parseInt(newMapping.points, 10) : "",
      timestamp: new Date().toISOString()
    });
    console.log("Mapping gespeichert:", {
      ...newMapping,
      levelStart,
      levelEnd,
      points: newMapping.points !== "" ? parseInt(newMapping.points, 10) : "",
      timestamp: new Date().toISOString(),
      docId: docRef.id
    });
    setNewMapping({
      chestName: "default",
      category: "",
      type: "",
      source: "",
      levelStart: "",
      levelEnd: "",
      points: ""
    });
  };

  const handleEdit = (mapping) => {
    setEditingId(mapping.id);
    setEditingMapping({ ...mapping });
  }

  const handleSaveEdit = async () => {
    let levelStart = editingMapping.levelStart;
    let levelEnd = editingMapping.levelEnd;
    if (editingMapping.category !== "Bank") {
      levelStart = levelStart !== "" ? parseInt(levelStart, 10) : "";
      levelEnd = levelEnd !== "" ? parseInt(levelEnd, 10) : "";
    }
    await updateDoc(doc(db, "chestMappings", editingId), {
      ...editingMapping,
      levelStart,
      levelEnd,
      points: editingMapping.points !== "" ? parseInt(editingMapping.points, 10) : ""
    });
    setEditingId(null);
    setEditingMapping({});
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "chestMappings", id));
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      {/* Automatisch erkannte, noch nicht gepflegte Truhen-Mappings */}
      <div className="w-full max-w-4xl bg-yellow-900 bg-opacity-30 rounded-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-300">Automatisch erkannte, noch nicht gepflegte Truhen-Mappings</h3>
        {/* Sortier-Buttons für Vorschlagsliste */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSortField('category')}
            className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'category' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}
          >
            Sortiere nach Kategorie
          </button>
          <button
            onClick={() => setSortField('chestName')}
            className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'chestName' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}
          >
            Sortiere nach Name
          </button>
          <button
            onClick={() => setSortField('level')}
            className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'level' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}
          >
            Sortiere nach Level
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`px-4 py-2 rounded-lg font-bold shadow ${sortOrder === 'asc' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
          </button>
        </div>
        {usedChestMappings.length === 0 ? (
          <p className="text-gray-400">Keine neuen Vorschläge gefunden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-yellow-800">
                  <th className="px-4 py-2 text-left">Truhen-Name</th>
                  <th className="px-4 py-2 text-left">Kategorie</th>
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {usedChestMappings
                  .slice() // Kopie für Sortierung
                  .sort((a, b) => {
                    let cmp = 0;
                    if (sortField === 'category') {
                      cmp = (a.category || '').localeCompare(b.category || '', 'de', { sensitivity: 'base' });
                      if (cmp === 0) cmp = (a.chestName || '').localeCompare(b.chestName || '', 'de', { sensitivity: 'base' });
                    } else if (sortField === 'chestName') {
                      cmp = (a.chestName || '').localeCompare(b.chestName || '', 'de', { sensitivity: 'base' });
                      if (cmp === 0) cmp = (a.category || '').localeCompare(b.category || '', 'de', { sensitivity: 'base' });
                    } else if (sortField === 'level') {
                      cmp = (a.level || '').toString().localeCompare((b.level || '').toString(), 'de', { sensitivity: 'base', numeric: true });
                    }
                    return sortOrder === 'asc' ? cmp : -cmp;
                  })
                  .map((mapping) => (
                    <tr key={mapping.id} className="border-b border-yellow-700">
                      <td className="px-4 py-2">{mapping.chestName}</td>
                      <td className="px-4 py-2">{mapping.category}</td>
                      <td className="px-4 py-2">{mapping.level}</td>
                      <td className="px-4 py-2">
                        <button
                          disabled={importing}
                          className="px-3 py-1 bg-yellow-600 rounded text-white text-sm hover:bg-yellow-700 transition"
                          onClick={() => importUsedMapping(mapping)}
                        >
                          Ins Mapping übernehmen
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">Truhen-Zuordnungen verwalten</h2>
      {/* Formular für neue Zuordnung */}
      <form onSubmit={handleAddMapping} className="mb-8 w-full max-w-4xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Neue Truhen-Zuordnung hinzufügen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Truhen-Name *</label>
            <select
              value={newMapping.chestName}
              onChange={(e) => setNewMapping({...newMapping, chestName: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {newMapping.category && [
                ...getChestNamesForCategory(newMapping.category),
                ...(newMapping.category === "Bank" ? [] : ["Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest"])
              ].map(chestName => (
                <option key={chestName} value={chestName}>{chestName}</option>
              ))}
            </select>
            {!newMapping.category && (
              <p className="text-xs text-gray-400 mt-1">Erst Kategorie wählen</p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Kategorie *</label>
            <select
              value={newMapping.category}
              onChange={(e) => {
                let val = e.target.value;
                // Für Bank immer exakt 'Bank' als Wert setzen
                if (val.toLowerCase().includes('bank')) val = 'Bank';
                setNewMapping({
                  ...newMapping,
                  category: val,
                  chestName: ""
                });
              }}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Type</label>
            <select
              value={newMapping.type}
              onChange={(e) => setNewMapping({...newMapping, type: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
            {Array.from(new Set([
              ...CHEST_TYPES,
              "Elven Citadel",
              "Cursed Citadel",
              "Wooden",
              "Bronze",
              "Silver",
              "Golden",
              "Precious",
              "Magic"
            ])).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Source</label>
            <select
              value={newMapping.source}
              onChange={(e) => setNewMapping({...newMapping, source: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {Array.from(new Set([
                ...CHEST_SOURCES,
                ...usedChestMappings.map(m => m.source),
                ...chestMappings.map(m => m.source),
                newMapping.source
              ].filter(Boolean))).map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Level Start</label>
            {newMapping.category === "Bank" ? (
              <select
                value={newMapping.levelStart}
                onChange={e => setNewMapping({ ...newMapping, levelStart: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Bitte wählen...</option>
                {['Wooden','Bronze','Silver','Golden','Precious','Magic'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={newMapping.levelStart}
                onChange={(e) => setNewMapping({...newMapping, levelStart: e.target.value})}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="z.B. 10"
              />
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Level Ende</label>
            {newMapping.category === "Bank" ? (
              <select
                value={newMapping.levelEnd}
                onChange={e => setNewMapping({ ...newMapping, levelEnd: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Bitte wählen...</option>
                {['Wooden','Bronze','Silver','Golden','Precious','Magic'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={newMapping.levelEnd}
                onChange={(e) => setNewMapping({...newMapping, levelEnd: e.target.value})}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="z.B. 15"
              />
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Punkte *</label>
            <input
              type="number"
              value={newMapping.points}
              onChange={(e) => setNewMapping({...newMapping, points: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="z.B. 64"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 rounded text-white font-semibold hover:bg-purple-700 transition"
          >
            Hinzufügen
          </button>
        </div>
      </form>

      {/* Liste der bestehenden Zuordnungen */}
      <div className="w-full max-w-6xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Bestehende Truhen-Zuordnungen</h3>
        {chestMappings.length === 0 ? (
          <p className="text-gray-400">Keine Truhen-Zuordnungen vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Truhen-Name</th>
                  <th className="px-4 py-2 text-left">Kategorie</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Punkte</th>
                  <th className="px-4 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {chestMappings.map((mapping) => {
                  // Firestore-IDs sind 20 Zeichen lang und bestehen nur aus [A-Za-z0-9_-]
                  const isValidId = mapping.id && /^[A-Za-z0-9_-]{20}$/.test(mapping.id);
                  return (
                    <tr key={mapping.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.chestName}
                            onChange={(e) => setEditingMapping({...editingMapping, chestName: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
                            {Array.from(new Set([
                              ...(editingMapping.category ? getChestNamesForCategory(editingMapping.category) : []),
                              ...(editingMapping.category === "Bank" ? [
                                "Wooden Chest",
                                "Bronze Chest",
                                "Silver Chest",
                                "Golden Chest",
                                "Precious Chest",
                                "Magic Chest"
                              ] : []),
                              ...usedChestMappings.map(m => m.chestName),
                              ...chestMappings.map(m => m.chestName),
                              editingMapping.chestName
                            ].filter(Boolean))).map(chestName => (
                              <option key={chestName} value={chestName}>{chestName}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.chestName
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.category}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val.toLowerCase().includes('bank')) val = 'Bank';
                              setEditingMapping({
                                ...editingMapping,
                                category: val,
                                chestName: ""
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            {Array.from(new Set([
                              ...categories,
                              ...usedChestMappings.map(m => m.category),
                              ...chestMappings.map(m => m.category),
                              editingMapping.category
                            ].filter(Boolean))).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.category
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.type}
                            onChange={(e) => setEditingMapping({...editingMapping, type: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
                            {Array.from(new Set([
                              ...CHEST_TYPES,
                              "Elven Citadel",
                              "Cursed Citadel",
                              "Wooden",
                              "Bronze",
                              "Silver",
                              "Golden",
                              "Precious",
                              "Magic"
                            ])).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.type || ""
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.source}
                            onChange={(e) => setEditingMapping({...editingMapping, source: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
                            {Array.from(new Set([
                              ...CHEST_SOURCES,
                              ...usedChestMappings.map(m => m.source),
                              ...chestMappings.map(m => m.source),
                              editingMapping.source,
                              "Elven Citadel",
                              "Cursed Citadel",
                              "Level 30 Citadel"
                            ].filter(Boolean))).map(source => (
                              <option key={source} value={source}>{source}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.source || ""
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          editingMapping.category === "Bank" ? (
                            <div className="flex gap-2">
                              <select
                                value={editingMapping.levelStart}
                                onChange={e => setEditingMapping({ ...editingMapping, levelStart: e.target.value })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Wooden">Wooden</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Golden">Golden</option>
                                <option value="Precious">Precious</option>
                                <option value="Magic">Magic</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                              <span className="text-gray-400">-</span>
                              <select
                                value={editingMapping.levelEnd}
                                onChange={e => setEditingMapping({ ...editingMapping, levelEnd: e.target.value })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Wooden">Wooden</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Golden">Golden</option>
                                <option value="Precious">Precious</option>
                                <option value="Magic">Magic</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <select
                                value={editingMapping.levelStart}
                                onChange={e => setEditingMapping({...editingMapping, levelStart: e.target.value})}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                              <span className="text-gray-400">-</span>
                              <select
                                value={editingMapping.levelEnd}
                                onChange={e => setEditingMapping({...editingMapping, levelEnd: e.target.value})}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                            </div>
                          )
                        ) : (
                          mapping.levelStart === mapping.levelEnd ?
                            mapping.levelStart :
                            `${mapping.levelStart} - ${mapping.levelEnd}`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <input
                            type="number"
                            value={editingMapping.points}
                            onChange={(e) => setEditingMapping({...editingMapping, points: e.target.value})}
                            className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          />
                        ) : (
                          (mapping.points === undefined || mapping.points === null || mapping.points === "") ? 0 : Number(mapping.points)
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 rounded text-white text-sm hover:bg-green-700 transition"
                            >
                              Speichern
                            </button>
                            <button
                              onClick={() => {setEditingId(null); setEditingMapping({});}}
                              className="px-3 py-1 bg-gray-600 rounded text-white text-sm hover:bg-gray-700 transition"
                            >
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                              <button
                                onClick={() => isValidId ? handleEdit(mapping) : null}
                                className={`px-3 py-1 rounded text-white text-sm transition ${isValidId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'}`}
                                disabled={!isValidId}
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => isValidId ? handleDelete(mapping.id) : null}
                                className={`px-3 py-1 rounded text-white text-sm transition ${isValidId ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 cursor-not-allowed'}`}
                                disabled={!isValidId}
                              >
                                Löschen
                              </button>
                            </div>
                            {!isValidId && (
                              <div className="text-xs text-red-400">Kann nicht bearbeitet oder gelöscht werden (ungültige ID)</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
          style={{ minWidth: 120 }}
        >
          &larr; Zurück
        </button>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">{t && t.copyright}</footer>
    </div>
  );
}

export default ManageChestMappingPage;
