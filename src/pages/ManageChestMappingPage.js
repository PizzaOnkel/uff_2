import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

export default function ManageChestMappingPage({ t, setCurrentPage }) {
  const [chestMappings, setChestMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({
    chestName: "",
    category: "",
    levelStart: "",
    levelEnd: "",
    points: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMapping, setEditingMapping] = useState({});

  const categories = [
    "Arena Chests",
    "Common Chests", 
    "Rare Chests",
    "Epic Chests",
    "Chests of Tartaros",
    "Elven Chests",
    "Cursed Chests",
    "Bank Chests",
    "Runic Chests",
    "Heroic Chests",
    "Vault of the Ancients",
    "Quick March Chest",
    "Ancients Chest",
    "ROTA Total",
    "Epic Ancient squad",
    "EAs Total",
    "Union Chest",
    "Union Total",
    "Jormungandr Chests",
    "Jormungandr Total"
  ];

  // Chest-Namen basierend auf der echten JSON-Analyse
  const chestNames = {
    // Level-basierte Chests (verwenden "default" als Name)
    "Arena Chests": ["default"],
    "Common Chests": ["default", "Barbarian Chest", "Common Chest"],
    "Rare Chests": ["default", "Orc Chest", "Rare Chest"],
    "Epic Chests": ["default", "Undead Chest", "Epic Chest"],
    "Chests of Tartaros": ["default", "Demon Chest", "Tartaros Chest"],
    "Elven Chests": ["default", "Elven Citadel Chest", "Elf Chest"],
    "Cursed Chests": ["default", "Cursed Chest"],
    "Runic Chests": ["default", "Runic Chest"],
    "Heroic Chests": ["default", "Heroic Chest"],
    "Vault of the Ancients": ["default", "Vault of the Ancients Chest", "Ancient Chest"],
    
    // Nicht level-basierte Chests (benötigen spezifische Namen)
    "Bank Chests": [
      "Wooden Chest",
      "Bronze Chest", 
      "Silver Chest",
      "Golden Chest",
      "Precious Chest",
      "Magic Chest"
    ],
    "Quick March Chest": ["Quick March Chest"],
    "Ancients Chest": ["Ancients Chest"],
    "Union Chest": ["Union Chest"],
    "Jormungandr Chests": ["Jormungandr Chest"],
    "Epic Ancient squad": ["Epic Ancient squad"],
    
    // Totals (nicht direkt zuordenbar)
    "ROTA Total": ["ROTA Total"],
    "EAs Total": ["EAs Total"],
    "Union Total": ["Union Total"],
    "Jormungandr Total": ["Jormungandr Total"]
  };

  // Aktuelle Chest-Namen basierend auf ausgewählter Kategorie
  const getChestNamesForCategory = (category) => {
    return chestNames[category] || ["default"];
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chestMappings"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sortiere nach Timestamp (neueste zuerst)
      const sortedList = list.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return timeB - timeA; // Neueste zuerst
      });
      
      setChestMappings(sortedList);
    });
    return () => unsub();
  }, []);

  const handleAddMapping = async (e) => {
    e.preventDefault();
    if (!newMapping.chestName || !newMapping.category || !newMapping.points) {
      alert("Bitte fülle alle Pflichtfelder aus!");
      return;
    }

    try {
      await addDoc(collection(db, "chestMappings"), {
        chestName: newMapping.chestName,
        category: newMapping.category,
        levelStart: parseInt(newMapping.levelStart) || 0,
        levelEnd: parseInt(newMapping.levelEnd) || parseInt(newMapping.levelStart) || 0,
        points: parseInt(newMapping.points),
        timestamp: new Date().toISOString()
      });
      
      setNewMapping({
        chestName: "",
        category: "",
        levelStart: "",
        levelEnd: "",
        points: ""
      });
      alert("Truhen-Zuordnung wurde erfolgreich hinzugefügt!");
    } catch (err) {
      console.error("Error adding mapping:", err);
      alert("Fehler beim Hinzufügen der Zuordnung!");
    }
  };

  const handleEdit = (mapping) => {
    setEditingId(mapping.id);
    setEditingMapping({
      chestName: mapping.chestName,
      category: mapping.category,
      levelStart: mapping.levelStart.toString(),
      levelEnd: mapping.levelEnd.toString(),
      points: mapping.points.toString()
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, "chestMappings", editingId), {
        chestName: editingMapping.chestName,
        category: editingMapping.category,
        levelStart: parseInt(editingMapping.levelStart) || 0,
        levelEnd: parseInt(editingMapping.levelEnd) || parseInt(editingMapping.levelStart) || 0,
        points: parseInt(editingMapping.points),
        timestamp: new Date().toISOString()
      });
      
      setEditingId(null);
      setEditingMapping({});
      alert("Truhen-Zuordnung wurde erfolgreich aktualisiert!");
    } catch (err) {
      console.error("Error updating mapping:", err);
      alert("Fehler beim Aktualisieren der Zuordnung!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Möchtest du diese Truhen-Zuordnung wirklich löschen?")) {
      try {
        await deleteDoc(doc(db, "chestMappings", id));
        alert("Truhen-Zuordnung wurde erfolgreich gelöscht!");
      } catch (err) {
        console.error("Error deleting mapping:", err);
        alert("Fehler beim Löschen der Zuordnung!");
      }
    }
  };

  const handleInitializeDefaultMappings = async () => {
    if (!window.confirm("Möchtest du die Standard-Truhen-Zuordnungen erstellen? Dies wird alle bestehenden Zuordnungen ersetzen!")) {
      return;
    }

    const defaultMappings = [
      // Arena
      { chestName: "Arena Chest", category: "Arena", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Olympus Chest", category: "Arena", levelStart: 0, levelEnd: 0, points: 0 },
      
      // Crypts - Common
      { chestName: "Sand Chest", category: "Crypts", levelStart: 5, levelEnd: 5, points: 2 },
      { chestName: "Sand Chest", category: "Crypts", levelStart: 10, levelEnd: 10, points: 10 },
      { chestName: "Sand Chest", category: "Crypts", levelStart: 15, levelEnd: 15, points: 20 },
      { chestName: "Sand Chest", category: "Crypts", levelStart: 20, levelEnd: 20, points: 64 },
      { chestName: "Sand Chest", category: "Crypts", levelStart: 25, levelEnd: 25, points: 256 },
      
      { chestName: "Bone Chest", category: "Crypts", levelStart: 5, levelEnd: 5, points: 2 },
      { chestName: "Bone Chest", category: "Crypts", levelStart: 10, levelEnd: 10, points: 10 },
      { chestName: "Bone Chest", category: "Crypts", levelStart: 15, levelEnd: 15, points: 20 },
      { chestName: "Bone Chest", category: "Crypts", levelStart: 20, levelEnd: 20, points: 64 },
      { chestName: "Bone Chest", category: "Crypts", levelStart: 25, levelEnd: 25, points: 256 },
      
      { chestName: "Stone Chest", category: "Crypts", levelStart: 5, levelEnd: 5, points: 2 },
      { chestName: "Stone Chest", category: "Crypts", levelStart: 10, levelEnd: 10, points: 10 },
      { chestName: "Stone Chest", category: "Crypts", levelStart: 15, levelEnd: 15, points: 20 },
      { chestName: "Stone Chest", category: "Crypts", levelStart: 20, levelEnd: 20, points: 64 },
      { chestName: "Stone Chest", category: "Crypts", levelStart: 25, levelEnd: 25, points: 256 },
      
      // Crypts - Rare
      { chestName: "Iron Chest", category: "Crypts", levelStart: 10, levelEnd: 10, points: 16 },
      { chestName: "Iron Chest", category: "Crypts", levelStart: 15, levelEnd: 15, points: 40 },
      { chestName: "Iron Chest", category: "Crypts", levelStart: 20, levelEnd: 20, points: 128 },
      { chestName: "Iron Chest", category: "Crypts", levelStart: 25, levelEnd: 25, points: 350 },
      { chestName: "Iron Chest", category: "Crypts", levelStart: 30, levelEnd: 30, points: 1280 },
      
      // Citadel
      { chestName: "Citadel Chest", category: "Citadel", levelStart: 10, levelEnd: 10, points: 20 },
      { chestName: "Citadel Chest", category: "Citadel", levelStart: 15, levelEnd: 15, points: 40 },
      { chestName: "Citadel Chest", category: "Citadel", levelStart: 20, levelEnd: 20, points: 80 },
      { chestName: "Citadel Chest", category: "Citadel", levelStart: 25, levelEnd: 25, points: 170 },
      { chestName: "Citadel Chest", category: "Citadel", levelStart: 30, levelEnd: 30, points: 350 },
      
      { chestName: "Cursed Citadel Chest", category: "Citadel", levelStart: 20, levelEnd: 20, points: 80 },
      { chestName: "Cursed Citadel Chest", category: "Citadel", levelStart: 25, levelEnd: 25, points: 170 },
      
      // Heroic Monster
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 16, levelEnd: 19, points: 40 },
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 20, levelEnd: 24, points: 75 },
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 25, levelEnd: 29, points: 150 },
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 30, levelEnd: 34, points: 250 },
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 35, levelEnd: 39, points: 350 },
      { chestName: "Heroic Chest", category: "Heroic Monster", levelStart: 40, levelEnd: 45, points: 500 },
      
      // Epic Monster
      { chestName: "Doomsday Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 8000 },
      { chestName: "Arachne Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 8000 },
      { chestName: "Armageddon Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 8000 },
      { chestName: "Fenrir Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 2000 },
      { chestName: "Jormungandr's Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 2000 },
      { chestName: "Ancient Chest", category: "Epic Monster", levelStart: 0, levelEnd: 0, points: 0 },
      
      // Bank Chests
      { chestName: "Wooden Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 50 },
      { chestName: "Bronze Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 100 },
      { chestName: "Silver Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 200 },
      { chestName: "Bank Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 500 },
      { chestName: "Precious Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 1000 },
      { chestName: "Magic Chest", category: "Bank Chests", levelStart: 0, levelEnd: 0, points: 2500 },
      
      // Andere Kategorien mit 0 Punkten
      { chestName: "Runic Chest", category: "Runic Squads", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Vault of the Ancients", category: "Vault of the Ancients", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Quick March Chest", category: "Rise of the Ancients", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Ancients' Chest", category: "Rise of the Ancients", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Epic Ancient squad Chest", category: "Epic Ancient squad", levelStart: 0, levelEnd: 0, points: 0 },
      { chestName: "Union Chest", category: "Union", levelStart: 0, levelEnd: 0, points: 0 },
    ];

    try {
      // Lösche alle bestehenden Zuordnungen
      const existingMappings = await getDocs(collection(db, "chestMappings"));
      for (const mapping of existingMappings.docs) {
        await deleteDoc(doc(db, "chestMappings", mapping.id));
      }

      // Füge Standard-Zuordnungen hinzu
      for (const mapping of defaultMappings) {
        await addDoc(collection(db, "chestMappings"), {
          ...mapping,
          timestamp: new Date().toISOString()
        });
      }

      alert("Standard-Truhen-Zuordnungen wurden erfolgreich erstellt!");
    } catch (err) {
      console.error("Error initializing mappings:", err);
      alert("Fehler beim Erstellen der Standard-Zuordnungen!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">Truhen-Zuordnungen verwalten</h2>
      
      {/* Formular für neue Zuordnung */}
      <form onSubmit={handleAddMapping} className="mb-8 w-full max-w-4xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Neue Truhen-Zuordnung hinzufügen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Truhen-Name *
            </label>
            <select
              value={newMapping.chestName}
              onChange={(e) => setNewMapping({...newMapping, chestName: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {newMapping.category && getChestNamesForCategory(newMapping.category).map(chestName => (
                <option key={chestName} value={chestName}>{chestName}</option>
              ))}
            </select>
            {!newMapping.category && (
              <p className="text-xs text-gray-400 mt-1">Erst Kategorie wählen</p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Kategorie *
            </label>
            <select
              value={newMapping.category}
              onChange={(e) => setNewMapping({
                ...newMapping, 
                category: e.target.value,
                chestName: "" // Reset chest name when category changes
              })}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Level Start
            </label>
            <input
              type="number"
              value={newMapping.levelStart}
              onChange={(e) => setNewMapping({...newMapping, levelStart: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="z.B. 10"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Level Ende
            </label>
            <input
              type="number"
              value={newMapping.levelEnd}
              onChange={(e) => setNewMapping({...newMapping, levelEnd: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="z.B. 15"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Punkte *
            </label>
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
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Punkte</th>
                  <th className="px-4 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {chestMappings.map((mapping) => (
                  <tr key={mapping.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">
                      {editingId === mapping.id ? (
                        <select
                          value={editingMapping.chestName}
                          onChange={(e) => setEditingMapping({...editingMapping, chestName: e.target.value})}
                          className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                        >
                          <option value="">Bitte wählen...</option>
                          {editingMapping.category && getChestNamesForCategory(editingMapping.category).map(chestName => (
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
                          onChange={(e) => setEditingMapping({
                            ...editingMapping, 
                            category: e.target.value,
                            chestName: "" // Reset chest name when category changes
                          })}
                          className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        mapping.category
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === mapping.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingMapping.levelStart}
                            onChange={(e) => setEditingMapping({...editingMapping, levelStart: e.target.value})}
                            className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            value={editingMapping.levelEnd}
                            onChange={(e) => setEditingMapping({...editingMapping, levelEnd: e.target.value})}
                            className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          />
                        </div>
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
                        mapping.points
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(mapping)}
                            className="px-3 py-1 bg-blue-600 rounded text-white text-sm hover:bg-blue-700 transition"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDelete(mapping.id)}
                            className="px-3 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700 transition"
                          >
                            Löschen
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-purple-300 underline"
      >
        Zurück zum Admin-Panel
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
