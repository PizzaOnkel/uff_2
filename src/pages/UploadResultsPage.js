import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function UploadResultsPage({ t, setCurrentPage }) {
  const [jsonData, setJsonData] = useState(null);
  const [fullJsonData, setFullJsonData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [periods, setPeriods] = useState([]);
  const [eventDate, setEventDate] = useState("");

  // Veranstaltungsperioden aus Firestore laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "periods"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPeriods(list);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Prüfe, ob es ein Objekt mit Datumsschlüssel(n) ist
        const dateKeys = Object.keys(data);
        if (dateKeys.length > 0 && dateKeys.every(key => Array.isArray(data[key]))) {
          // Speichere alle Daten für spätere Auswahl
          setFullJsonData(data);
          setAvailableDates(dateKeys);
          
          // Nimm das erste (neueste) Datum als Standard
          const firstDate = dateKeys[0];
          setJsonData(data[firstDate]);
          setEventDate(firstDate);
          setError("");
          
          // Zeige eine Info, wenn mehrere Daten verfügbar sind
          if (dateKeys.length > 1) {
            console.log(`Mehrere Daten in der Datei gefunden: ${dateKeys.join(', ')}. Verwende ${firstDate}.`);
          }
        } else {
          setError("Die JSON-Datei hat nicht das erwartete Format. Erwartet: {\"datum\": [spielerErgebnisse]}");
          setJsonData(null);
          setFullJsonData(null);
          setAvailableDates([]);
          setEventDate("");
        }
      } catch (err) {
        setError("Fehler beim Einlesen der Datei: Ungültiges JSON-Format.");
        setJsonData(null);
        setFullJsonData(null);
        setAvailableDates([]);
        setEventDate("");
      }
    };
    reader.readAsText(file);
  };

  // Funktion zum Konvertieren der Truhen von deinem Format ins erwartete Format
  const convertChests = (rawChests) => {
    if (!rawChests || !Array.isArray(rawChests)) return [];
    
    // Mapping von Truhen-Namen zu Kategorien
    const categoryMapping = {
      'Arena Chest': 'Arena Chests',
      'Sand Chest': 'Common Chests', 
      'Bone Chest': 'Common Chests',
      'Iron Chest': 'Rare Chests',
      'Steel Chest': 'Rare Chests',
      'Golden Chest': 'Epic Chests',
      'Tartaros Chest': 'Chests of Tartaros',
      'Citadel Chest': 'Citadel Chests',
      'Cursed Citadel Chest': 'Citadel cursed Chests',
      'Bank Chest': 'Bank Chests',
      'Runic Chest': 'Runic Chests',
      'Heroic Chest': 'Heroic Chests',
      'Vault of the Ancients': 'Vault of the Ancients',
      'Quick March Chest': 'Quick March Chest',
      'Ancient Chest': 'Ancients Chest',
      'Jormungandr\'s Chest': 'Jormungandr Chests',
      'Union Chest': 'Union Chest',
      'Olympus Chest': 'Arena Chests' // Olympus Chests als Arena Chests behandeln
    };

    // Gruppiere die Truhen nach Kategorie und Level
    const grouped = {};
    rawChests.forEach(chest => {
      const category = categoryMapping[chest.Name] || 'Common Chests';
      const level = chest.Level || 0;
      const key = `${category}-${level}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          category,
          level,
          count: 0,
          points: 0
        };
      }
      grouped[key].count++;
      
      // Einfache Punkteberechnung (kann angepasst werden)
      if (level > 0) {
        grouped[key].points += level * 10; // 10 Punkte pro Level
      } else {
        grouped[key].points += 50; // Standard für Level 0
      }
    });

    return Object.values(grouped);
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setEventDate(selectedDate);
    if (fullJsonData && fullJsonData[selectedDate]) {
      setJsonData(fullJsonData[selectedDate]);
    }
  };

  // JSON-Ergebnisse pro Spieler als eigenes Dokument speichern
  const handleUpload = async () => {
    if (!jsonData || !selectedPeriod) {
      setError("Bitte wähle eine Veranstaltungsperiode und lade eine Datei hoch.");
      return;
    }
    if (!Array.isArray(jsonData)) {
      setError("Die JSON-Datei muss ein Array von Spieler-Ergebnissen enthalten.");
      return;
    }
    try {
      for (const playerResult of jsonData) {
        // Konvertiere die Truhen ins richtige Format
        const convertedChests = convertChests(playerResult.chests);
        
        await addDoc(collection(db, "results"), {
          periodId: selectedPeriod,
          eventDate: eventDate,
          Clanmate: playerResult.Clanmate,
          Points: playerResult.Points || 0,
          chests: convertedChests,
          timestamp: new Date().toISOString()
        });
      }
      setJsonData(null);
      setSelectedPeriod("");
      setEventDate("");
      setError("");
      alert("Alle Spieler-Ergebnisse wurden erfolgreich hochgeladen und zugeordnet!");
    } catch (err) {
      setError("Fehler beim Hochladen der Ergebnisse.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-orange-400">{t.uploadResultsTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        {jsonData && (
          <div className="mb-4">
            {availableDates.length > 1 && (
              <div className="mb-4">
                <label className="block mb-2 text-lg font-semibold text-orange-300">
                  Ereignisdatum auswählen:
                </label>
                <select
                  value={eventDate}
                  onChange={handleDateChange}
                  className="mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {date} ({fullJsonData[date].length} Spieler)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="block mb-2 text-lg font-semibold text-orange-300">
              Veranstaltungsperiode auswählen:
            </label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
            >
              <option value="">Bitte auswählen...</option>
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.start} bis {period.end})
                </option>
              ))}
            </select>
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-orange-600 rounded text-white font-semibold hover:bg-orange-700 transition w-full"
            >
              Datei zuordnen & hochladen ({eventDate}, {jsonData.length} Spieler)
            </button>
          </div>
        )}
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {jsonData && (
          <div className="bg-gray-800 rounded p-4 text-sm overflow-x-auto max-h-96">
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        )}
      </div>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-orange-300 underline"
      >
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}