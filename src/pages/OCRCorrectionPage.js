import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import StickyBackButton from "../components/StickyBackButton";
import { ROUTES } from "../routes";

// OCR-Korrektur-Regeln (editierbar)
const DEFAULT_OCR_RULES = [
  { pattern: "Ancientsâ€˜", replacement: "Ancient's", description: "Encoding-Problem mit Apostroph" },
  { pattern: "Ancients'", replacement: "Ancient's", description: "Falscher Plural" },
  { pattern: "Jörmungandr's", replacement: "Jormungandr's", description: "Umlaut-Problem" },
  { pattern: "Elvrin", replacement: "Elven", description: "OCR-Lesefehler" },
  { pattern: "Elveri", replacement: "Elven", description: "OCR-Lesefehler" },
  { pattern: "Level EO", replacement: "Level 30", description: "E0 → 30" },
  { pattern: "Level ES", replacement: "Level 35", description: "ES → 35" },
  { pattern: "Level IO", replacement: "Level 10", description: "I0 → 10" },
  { pattern: "Level IS", replacement: "Level 15", description: "IS → 15" },
  { pattern: "Level 2S", replacement: "Level 25", description: "2S → 25" },
  { pattern: "Level 2O", replacement: "Level 20", description: "2O → 20" },
  { pattern: "Level O", replacement: "Level 0", description: "O → 0" },
  { pattern: "heroÃ¯c", replacement: "heroic", description: "Encoding-Problem" },
  { pattern: "Ð¡", replacement: "", description: "Fehlerhaftes Zeichen entfernen" }
];

function OCRCorrectionPage({ setCurrentPage }) {
  const [rawChestData, setRawChestData] = useState([]);
  const [correctedData, setCorrectedData] = useState([]);
  const [ocrRules, setOcrRules] = useState(DEFAULT_OCR_RULES);
  const [newRule, setNewRule] = useState({ pattern: "", replacement: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // OCR-Korrektur-Funktion
  function applyOCRCorrection(text) {
    if (!text || typeof text !== 'string') return text;
    
    let corrected = text;
    ocrRules.forEach(rule => {
      if (rule.pattern && rule.replacement !== undefined) {
        const regex = new RegExp(rule.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        corrected = corrected.replace(regex, rule.replacement);
      }
    });
    
    return corrected
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Lade alle rohen Chest-Daten
  useEffect(() => {
    async function loadRawChestData() {
      setLoading(true);
      try {
        const resultsSnap = await getDocs(collection(db, "results"));
        const allChests = [];
        
        resultsSnap.forEach(doc => {
          const data = doc.data();
          if (Array.isArray(data.chests)) {
            data.chests.forEach(chest => {
              const chestName = chest.chestName || chest.Name || chest.name || chest.type || chest.Type || chest.id || '';
              const type = chest.type || chest.Type || '';
              const source = chest.source || chest.Source || '';
              const level = chest.level || chest.Level || '';
              
              if (chestName) {
                allChests.push({
                  original: chestName,
                  corrected: applyOCRCorrection(chestName),
                  type: type,
                  source: source,
                  level: level,
                  docId: doc.id
                });
              }
            });
          }
        });
        
        // Duplikate entfernen und sortieren
        const uniqueChests = Array.from(
          new Map(allChests.map(chest => [chest.original, chest])).values()
        ).sort((a, b) => a.original.localeCompare(b.original));
        
        setRawChestData(uniqueChests);
        setCorrectedData(uniqueChests);
      } catch (error) {
        console.error("Fehler beim Laden der Chest-Daten:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRawChestData();
  }, [ocrRules]);

  // Neue OCR-Regel hinzufügen
  const addOCRRule = () => {
    if (newRule.pattern && newRule.replacement !== undefined) {
      setOcrRules([...ocrRules, { ...newRule }]);
      setNewRule({ pattern: "", replacement: "", description: "" });
    }
  };

  // OCR-Regel löschen
  const removeOCRRule = (index) => {
    setOcrRules(ocrRules.filter((_, i) => i !== index));
  };

  // Gefilterte Daten
  const filteredData = correctedData.filter(chest => 
    !filter || chest.original.toLowerCase().includes(filter.toLowerCase()) ||
    chest.corrected.toLowerCase().includes(filter.toLowerCase())
  );

  // Nur Daten mit Unterschieden anzeigen
  const changedData = filteredData.filter(chest => chest.original !== chest.corrected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-4">
      <StickyBackButton onClick={() => setCurrentPage(ROUTES.MANAGE_CHEST_MAPPING)} />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          🔧 OCR-Korrektur Administration
        </h1>

        {/* OCR-Regeln verwalten */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">📝 OCR-Korrektur-Regeln</h2>
          
          {/* Neue Regel hinzufügen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
            <input
              type="text"
              placeholder="Fehlerhafter Text (z.B. Elvrin)"
              value={newRule.pattern}
              onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
              className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
            />
            <input
              type="text"
              placeholder="Korrektur (z.B. Elven)"
              value={newRule.replacement}
              onChange={(e) => setNewRule({...newRule, replacement: e.target.value})}
              className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
            />
            <input
              type="text"
              placeholder="Beschreibung (optional)"
              value={newRule.description}
              onChange={(e) => setNewRule({...newRule, description: e.target.value})}
              className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
            />
            <button
              onClick={addOCRRule}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              ➕ Regel hinzufügen
            </button>
          </div>

          {/* Bestehende Regeln */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Fehlerhaft</th>
                  <th className="px-4 py-2 text-left">Korrektur</th>
                  <th className="px-4 py-2 text-left">Beschreibung</th>
                  <th className="px-4 py-2 text-left">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {ocrRules.map((rule, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="px-4 py-2 font-mono text-red-300">{rule.pattern}</td>
                    <td className="px-4 py-2 font-mono text-green-300">{rule.replacement}</td>
                    <td className="px-4 py-2 text-gray-300">{rule.description}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeOCRRule(index)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        🗑️ Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vorher/Nachher Vergleich */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">
            🔍 Korrektur-Vorschau ({changedData.length} Änderungen erkannt)
          </h2>
          
          {/* Filter */}
          <input
            type="text"
            placeholder="🔍 Filtern nach Chest-Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-gray-600 border border-gray-500 rounded text-white"
          />

          {loading ? (
            <p className="text-center text-gray-400">Lade Chest-Daten...</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full table-auto">
                <thead className="sticky top-0 bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">❌ Original (fehlerhaft)</th>
                    <th className="px-4 py-2 text-left">✅ Korrigiert</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {changedData.map((chest, index) => (
                    <tr key={index} className="border-b border-gray-600">
                      <td className="px-4 py-2 font-mono text-red-300">{chest.original}</td>
                      <td className="px-4 py-2 font-mono text-green-300">{chest.corrected}</td>
                      <td className="px-4 py-2 text-gray-300">{chest.type}</td>
                      <td className="px-4 py-2 text-gray-300">{chest.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {changedData.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  {filter ? "Keine passenden Daten gefunden." : "Keine OCR-Korrekturen erforderlich - alle Daten sind bereits korrekt! 🎉"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-800 bg-opacity-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">📊 Gesamt Chests</h3>
            <p className="text-3xl font-bold text-blue-300">{rawChestData.length}</p>
          </div>
          <div className="bg-red-800 bg-opacity-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">🔧 Korrekturen</h3>
            <p className="text-3xl font-bold text-red-300">{changedData.length}</p>
          </div>
          <div className="bg-green-800 bg-opacity-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">✅ Korrekt</h3>
            <p className="text-3xl font-bold text-green-300">{rawChestData.length - changedData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OCRCorrectionPage;