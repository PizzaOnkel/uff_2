import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function UploadResultsPage({ t, setCurrentPage }) {
  console.log("🔄 UploadResultsPage component loaded");
  
  const [jsonData, setJsonData] = useState(null);
  const [fullJsonData, setFullJsonData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [periods, setPeriods] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [chestMappings, setChestMappings] = useState([]);

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

  // Truhen-Zuordnungen aus Firestore laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chestMappings"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChestMappings(list);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    console.log("🚀 handleFileChange called!");
    const file = e.target.files[0];
    
    if (!file) {
      console.log("❌ No file selected");
      return;
    }
    
    console.log("📁 File selected:", file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        console.log("� File content length:", jsonString.length);
        
        const data = JSON.parse(jsonString);
        console.log("✅ JSON parsed successfully");
        
        // Einfache Validierung: Ist es ein Objekt?
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          console.log("❌ Data is not an object");
          setError("Die JSON-Datei muss ein Objekt mit Datumsschlüsseln enthalten.");
          return;
        }
        
        const dateKeys = Object.keys(data);
        console.log("🔍 Found keys:", dateKeys);
        
        // Prüfe, ob mindestens ein Key vorhanden ist
        if (dateKeys.length === 0) {
          console.log("❌ No keys found");
          setError("Die JSON-Datei enthält keine Daten.");
          return;
        }
        
        // Prüfe, ob alle Werte Arrays sind
        let allValuesAreArrays = true;
        for (const key of dateKeys) {
          if (!Array.isArray(data[key])) {
            console.log(`❌ Key "${key}" is not an array:`, typeof data[key]);
            allValuesAreArrays = false;
            break;
          } else {
            console.log(`✅ Key "${key}" is array with ${data[key].length} items`);
          }
        }
        
        if (!allValuesAreArrays) {
          setError("Alle Werte in der JSON-Datei müssen Arrays von Spielerdaten sein.");
          return;
        }
        
        // Erfolgreiche Validierung
        console.log("🎉 Validation successful!");
        setFullJsonData(data);
        setAvailableDates(dateKeys);
        
        // Nimm das erste Datum als Standard
        const firstDate = dateKeys[0];
        setJsonData(data[firstDate]);
        setEventDate(firstDate);
        setError("");
        
        console.log(`📊 Using date: ${firstDate} with ${data[firstDate].length} players`);
        
      } catch (err) {
        console.log("❌ JSON parse error:", err.message);
        setError("Fehler beim Einlesen der Datei: Ungültiges JSON-Format.");
        setJsonData(null);
        setFullJsonData(null);
        setAvailableDates([]);
        setEventDate("");
      }
    };
    
    reader.readAsText(file);
  };

  // Funktion zum Konvertieren der Truhen basierend auf Firestore-Zuordnungen
  const convertChests = (rawChests) => {
    if (!rawChests || !Array.isArray(rawChests)) return [];
    
    const getChestPoints = (chestName, level) => {
      // Suche nach passender Zuordnung in der Firestore-Datenbank
      const mapping = chestMappings.find(m => 
        m.chestName === chestName && 
        level >= m.levelStart && 
        level <= m.levelEnd
      );
      
      if (mapping) {
        return mapping.points;
      }
      
      // Fallback: Unbekannte Truhen
      console.warn(`Unbekannte Truhe: ${chestName} (Level: ${level})`);
      return 0;
    };

    const getCategoryForChest = (chestName, level) => {
      // Suche nach passender Zuordnung in der Firestore-Datenbank
      const mapping = chestMappings.find(m => 
        m.chestName === chestName && 
        level >= m.levelStart && 
        level <= m.levelEnd
      );
      
      if (mapping) {
        return mapping.category;
      }
      
      return 'Unknown';
    };

    // Gruppiere die Truhen nach Kategorie und Level
    const grouped = {};
    rawChests.forEach(chest => {
      const chestName = chest.Name;
      const level = chest.Level || 0;
      
      const category = getCategoryForChest(chestName, level);
      const points = getChestPoints(chestName, level);
      
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
      grouped[key].points += points;
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
      // Prüfe zuerst, ob bereits Daten für diese Periode existieren
      const existingResultsQuery = query(
        collection(db, "results"),
        where("periodId", "==", selectedPeriod),
        where("eventDate", "==", eventDate)
      );
      
      const existingResultsSnapshot = await getDocs(existingResultsQuery);
      
      // Lösche alle bestehenden Ergebnisse für diese Periode und dieses Datum
      if (!existingResultsSnapshot.empty) {
        console.log(`🗑️ Lösche ${existingResultsSnapshot.docs.length} bestehende Ergebnisse für ${eventDate}`);
        
        for (const docSnapshot of existingResultsSnapshot.docs) {
          await deleteDoc(doc(db, "results", docSnapshot.id));
        }
      }
      
      // Gruppiere die Spieler nach Namen und summiere ihre Daten
      const playerMap = new Map();
      
      for (const playerResult of jsonData) {
        const playerName = playerResult.Clanmate;
        
        if (playerMap.has(playerName)) {
          // Spieler bereits vorhanden, summiere die Daten
          const existingPlayer = playerMap.get(playerName);
          existingPlayer.Points += (playerResult.Points || 0);
          existingPlayer.chests = existingPlayer.chests.concat(playerResult.chests || []);
        } else {
          // Neuer Spieler
          playerMap.set(playerName, {
            Clanmate: playerName,
            Points: playerResult.Points || 0,
            chests: playerResult.chests || []
          });
        }
      }
      
      console.log(`📊 Zusammengefasste Spieler: ${playerMap.size} einzigartige Spieler`);
      
      // Speichere die zusammengefassten Spieler
      for (const [playerName, playerData] of playerMap) {
        // Konvertiere die Truhen ins richtige Format
        const convertedChests = convertChests(playerData.chests);
        
        console.log(`💾 Speichere ${playerName} mit ${playerData.Points} Punkten und ${playerData.chests.length} Truhen`);
        
        await addDoc(collection(db, "results"), {
          periodId: selectedPeriod,
          eventDate: eventDate,
          Clanmate: playerData.Clanmate,
          Points: playerData.Points,
          chests: convertedChests,
          timestamp: new Date().toISOString()
        });
      }
      
      setJsonData(null);
      setSelectedPeriod("");
      setEventDate("");
      setError("");
      alert(`Alle Spieler-Ergebnisse wurden erfolgreich hochgeladen! ${playerMap.size} einzigartige Spieler gespeichert.`);
    } catch (err) {
      console.error("Upload error:", err);
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