import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

export default function ManageChestMappingPage({ t, setCurrentPage }) {
  const [chestMappings, setChestMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({
    chestName: "default",
    category: "",
    levelStart: "",
    levelEnd: "",
    points: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMapping, setEditingMapping] = useState({});

  const categories = [
    "Arena", "Common", "Rare", "Epic", "Tartaros",
    "Elven", "Cursed", "Bank", "Runic", "Heroic",
    "Vota", "Quick March", "Ancients", "ROTA", "Epic Ancient",
    "Union", "Jormungandr"
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chestMappings"), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setChestMappings(list);
    });
    return unsub;
  }, []);

  // Chest-Namen basierend auf der echten JSON-Analyse
  const chestNames = {
    // Level-basierte Chests (verwenden "default" als Name)
    "Arena Chests": ["default"],
    "Common Chests": ["default"],
    "Rare Chests": ["default"],
    "Epic Chests": ["default"],
    "Chests of Tartaros": ["default"],
    "Elven Chests": ["default"],
    "Cursed Chests": ["default"],
    "Runic Chests": ["default"],
    "Heroic Chests": ["default"],
    "Vault of the Ancients": ["default"],
    
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
      // Speichere alles in Kleinschreibung und ohne überflüssige Leerzeichen
      await addDoc(collection(db, "chestMappings"), {
        chestName: newMapping.chestName.trim().toLowerCase(),
        category: newMapping.category.trim().toLowerCase(),
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

  const handleEdit = (m) => {
    setEditingId(m.id);
    setEditingMapping({
      chestName: m.chestName, category: m.category,
      levelStart: m.levelStart.toString(),
      levelEnd: m.levelEnd.toString(),
      points: m.points.toString()
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Speichere alles in Kleinschreibung und ohne überflüssige Leerzeichen
      await updateDoc(doc(db, "chestMappings", editingId), {
        chestName: editingMapping.chestName.trim().toLowerCase(),
        category: editingMapping.category.trim().toLowerCase(),
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
                <option key={cat} value={cat}>{cat.toLowerCase()}</option>
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
                            <option key={chestName} value={chestName}>{chestName.toLowerCase()}</option>
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
