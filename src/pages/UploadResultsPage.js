import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentDate: '' });

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

  // Funktion zum Konvertieren der Truhen basierend auf Google Sheets-Logik
  const convertChests = (rawChests) => {
    if (!rawChests || !Array.isArray(rawChests)) return {};
    
    console.log("🔄 Converting chests:", rawChests.length);
    
    // Initialisiere die Struktur basierend auf den Kategorien aus CurrentTotalEventPage
    const chestCounts = {
      "Arena Chests": {},
      "Common Chests": { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 },
      "Rare Chests": { 10: 0, 15: 0, 20: 0, 25: 0, 30: 0 },
      "Epic Chests": { 15: 0, 20: 0, 25: 0, 30: 0, 35: 0 },
      "Chests of Tartaros": { 15: 0, 20: 0, 25: 0, 30: 0, 35: 0 },
      "Elven Chests": { 10: 0, 15: 0, 20: 0, 25: 0, 30: 0 },
      "Cursed Chests": { 20: 0, 25: 0 },
      "Bank Chests": { "Wooden": 0, "Bronze": 0, "Silver": 0, "Golden": 0, "Precious": 0, "Magic": 0 },
      "Runic Chests": { "20-24": 0, "25-29": 0, "30-34": 0, "35-39": 0, "40-44": 0, "45": 0 },
      "Heroic Chests": {},
      "Vault of the Ancients": { "10-14": 0, "15-19": 0, "20-24": 0, "25-29": 0, "30-34": 0, "35-39": 0, "40-44": 0 },
      "Quick March Chest": { total: 0 },
      "Ancients Chest": { total: 0 },
      "ROTA Total": { total: 0 },
      "Epic Ancient squad": { total: 0 },
      "EAs Total": { total: 0 },
      "Union Chest": { total: 0 },
      "Union Total": { total: 0 },
      "Jormungandr Chests": { total: 0 },
      "Jormungandr Total": { total: 0 }
    };

    // Initialisiere Heroic Chests (16-45)
    for (let i = 16; i <= 45; i++) {
      chestCounts["Heroic Chests"][i] = 0;
    }

    // Verarbeite jede Truhe
    rawChests.forEach(chest => {
      const chestName = chest.Name;
      const level = chest.Level || 0;
      
      console.log(`📦 Processing chest: ${chestName} (Level: ${level})`);
      
      // Mapping-Logik basierend auf Google Sheets
      if (chestName.includes("Arena")) {
        // Arena Chests haben keine Level-Unterteilungen
        if (!chestCounts["Arena Chests"].total) chestCounts["Arena Chests"].total = 0;
        chestCounts["Arena Chests"].total++;
      }
      else if (chestName.includes("Common") || chestName.includes("Barbarian")) {
        // Common Chests: Barbarian Chest, Common Chest, etc.
        if (chestCounts["Common Chests"][level] !== undefined) {
          chestCounts["Common Chests"][level]++;
        }
      }
      else if (chestName.includes("Rare") || chestName.includes("Orc")) {
        // Rare Chests: Orc Chest, Rare Chest, etc.
        if (chestCounts["Rare Chests"][level] !== undefined) {
          chestCounts["Rare Chests"][level]++;
        }
      }
      else if (chestName.includes("Epic") || chestName.includes("Undead")) {
        // Epic Chests: Undead Chest, Epic Chest, etc.
        if (chestCounts["Epic Chests"][level] !== undefined) {
          chestCounts["Epic Chests"][level]++;
        }
      }
      else if (chestName.includes("Tartaros") || chestName.includes("Demon")) {
        // Chests of Tartaros: Demon Chest, Tartaros Chest, etc.
        if (chestCounts["Chests of Tartaros"][level] !== undefined) {
          chestCounts["Chests of Tartaros"][level]++;
        }
      }
      else if (chestName.includes("Elven") || chestName.includes("Elf")) {
        // Elven Chests: Elven Citadel Chest, Elf Chest, etc.
        if (chestCounts["Elven Chests"][level] !== undefined) {
          chestCounts["Elven Chests"][level]++;
        }
      }
      else if (chestName.includes("Cursed")) {
        // Cursed Chests
        if (chestCounts["Cursed Chests"][level] !== undefined) {
          chestCounts["Cursed Chests"][level]++;
        }
      }
      else if (chestName.includes("Wealth") || chestName.includes("Bank")) {
        // Bank Chests: verschiedene Typen basierend auf Beschreibung
        let bankType = "Wooden"; // Default
        if (chestName.includes("Uncommon")) bankType = "Bronze";
        else if (chestName.includes("Rare")) bankType = "Silver";
        else if (chestName.includes("Epic")) bankType = "Golden";
        else if (chestName.includes("Legendary")) bankType = "Precious";
        else if (chestName.includes("Magic")) bankType = "Magic";
        
        chestCounts["Bank Chests"][bankType]++;
      }
      else if (chestName.includes("Runic")) {
        // Runic Chests: Level-Bereiche
        let runicLevel = "20-24"; // Default
        if (level >= 20 && level <= 24) runicLevel = "20-24";
        else if (level >= 25 && level <= 29) runicLevel = "25-29";
        else if (level >= 30 && level <= 34) runicLevel = "30-34";
        else if (level >= 35 && level <= 39) runicLevel = "35-39";
        else if (level >= 40 && level <= 44) runicLevel = "40-44";
        else if (level >= 45) runicLevel = "45";
        
        chestCounts["Runic Chests"][runicLevel]++;
      }
      else if (chestName.includes("Heroic")) {
        // Heroic Chests: Level 16-45
        if (level >= 16 && level <= 45) {
          chestCounts["Heroic Chests"][level]++;
        }
      }
      else if (chestName.includes("Vault") || chestName.includes("Ancient")) {
        // Vault of the Ancients: Level-Bereiche
        let vaultLevel = "10-14"; // Default
        if (level >= 10 && level <= 14) vaultLevel = "10-14";
        else if (level >= 15 && level <= 19) vaultLevel = "15-19";
        else if (level >= 20 && level <= 24) vaultLevel = "20-24";
        else if (level >= 25 && level <= 29) vaultLevel = "25-29";
        else if (level >= 30 && level <= 34) vaultLevel = "30-34";
        else if (level >= 35 && level <= 39) vaultLevel = "35-39";
        else if (level >= 40 && level <= 44) vaultLevel = "40-44";
        
        chestCounts["Vault of the Ancients"][vaultLevel]++;
      }
      else if (chestName.includes("Quick March")) {
        chestCounts["Quick March Chest"].total++;
      }
      else if (chestName.includes("Union")) {
        chestCounts["Union Chest"].total++;
      }
      else if (chestName.includes("Jormungandr")) {
        chestCounts["Jormungandr Chests"].total++;
      }
      else {
        // Fallback für unbekannte Truhen
        console.warn(`⚠️ Unbekannte Truhe: ${chestName} (Level: ${level})`);
        // Versuche Firestore-Mapping als Fallback
        const mapping = chestMappings.find(m => 
          m.chestName === chestName && 
          level >= m.levelStart && 
          level <= m.levelEnd
        );
        if (mapping && chestCounts[mapping.category]) {
          if (chestCounts[mapping.category][level] !== undefined) {
            chestCounts[mapping.category][level]++;
          } else if (chestCounts[mapping.category].total !== undefined) {
            chestCounts[mapping.category].total++;
          }
        }
      }
    });

    // Berechne Totals für aggregierte Kategorien
    chestCounts["ROTA Total"].total = 
      Object.values(chestCounts["Vault of the Ancients"]).reduce((sum, count) => sum + count, 0);
    
    chestCounts["EAs Total"].total = 
      (chestCounts["Ancients Chest"].total || 0) + 
      (chestCounts["Epic Ancient squad"].total || 0);
    
    chestCounts["Union Total"].total = chestCounts["Union Chest"].total;
    chestCounts["Jormungandr Total"].total = chestCounts["Jormungandr Chests"].total;

    console.log("✅ Converted chests:", chestCounts);
    return chestCounts;
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  // JSON-Ergebnisse pro Spieler als eigenes Dokument speichern
  const handleUpload = async () => {
    if (!fullJsonData || !selectedPeriod) {
      setError("Bitte wähle eine Veranstaltungsperiode und lade eine Datei hoch.");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      const totalDates = Object.keys(fullJsonData).length;
      setUploadProgress({ current: 0, total: totalDates + 1, currentDate: 'Vorbereitung...' });
      
      // SCHRITT 1: Lösche alle bestehenden Ergebnisse für diese Periode
      setUploadProgress({ current: 0, total: totalDates + 1, currentDate: 'Lösche bestehende Daten...' });
      
      const existingResultsQuery = query(
        collection(db, "results"),
        where("periodId", "==", selectedPeriod)
      );
      
      const existingResultsSnapshot = await getDocs(existingResultsQuery);
      
      if (!existingResultsSnapshot.empty) {
        console.log(`🗑️ Lösche ${existingResultsSnapshot.docs.length} bestehende Ergebnisse für die Periode`);
        
        for (const docSnapshot of existingResultsSnapshot.docs) {
          await deleteDoc(doc(db, "results", docSnapshot.id));
        }
      }
      
      // SCHRITT 2: Sammle und aggregiere ALLE Spielerdaten über ALLE Tage
      setUploadProgress({ current: 1, total: totalDates + 1, currentDate: 'Aggregiere Spielerdaten...' });
      
      const globalPlayerMap = new Map(); // Hier sammeln wir ALLE Spieler über ALLE Tage
      let processedDates = 0;
      
      // Durchlaufe alle Event-Tage und sammle Spielerdaten
      for (const [currentEventDate, currentJsonData] of Object.entries(fullJsonData)) {
        console.log(`🗓️ Verarbeite Datum: ${currentEventDate} mit ${currentJsonData.length} Einträgen`);
        
        if (!Array.isArray(currentJsonData)) {
          console.warn(`⚠️ Daten für ${currentEventDate} sind kein Array, überspringe...`);
          continue;
        }
        
        // Verarbeite jeden Spieler für dieses Datum
        for (const playerResult of currentJsonData) {
          const playerName = playerResult.Clanmate;
          
          if (globalPlayerMap.has(playerName)) {
            // Spieler bereits vorhanden, summiere die Daten über alle Tage
            const existingPlayer = globalPlayerMap.get(playerName);
            existingPlayer.Points += (playerResult.Points || 0);
            existingPlayer.chests = existingPlayer.chests.concat(playerResult.chests || []);
            
            // Füge das Datum zur Liste hinzu
            if (!existingPlayer.eventDates.includes(currentEventDate)) {
              existingPlayer.eventDates.push(currentEventDate);
            }
          } else {
            // Neuer Spieler - erstelle Eintrag
            globalPlayerMap.set(playerName, {
              Clanmate: playerName,
              Points: playerResult.Points || 0,
              chests: playerResult.chests || [],
              eventDates: [currentEventDate]
            });
          }
        }
        
        processedDates++;
        setUploadProgress({ 
          current: processedDates + 1, 
          total: totalDates + 1, 
          currentDate: `Verarbeitet: ${currentEventDate}` 
        });
        
        // Kurze Pause für bessere UX
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // SCHRITT 3: Speichere die aggregierten Spielerdaten
      setUploadProgress({ 
        current: totalDates + 1, 
        total: totalDates + 1, 
        currentDate: `Speichere ${globalPlayerMap.size} Spieler...` 
      });
      
      console.log(`📊 Gesamt-Aggregation: ${globalPlayerMap.size} einzigartige Spieler über ${totalDates} Tage`);
      
      for (const [playerName, playerData] of globalPlayerMap) {
        // Konvertiere die Truhen ins richtige Format
        const convertedChests = convertChests(playerData.chests);
        
        console.log(`💾 Speichere ${playerName} mit ${playerData.Points} Punkten (${playerData.chests.length} Truhen) über ${playerData.eventDates.length} Tage`);
        
        await addDoc(collection(db, "results"), {
          periodId: selectedPeriod,
          Clanmate: playerData.Clanmate,
          Points: playerData.Points,
          chests: convertedChests,
          eventDates: playerData.eventDates, // Alle Tage, an denen der Spieler aktiv war
          totalEventDays: playerData.eventDates.length, // Anzahl der aktiven Tage
          timestamp: new Date().toISOString()
        });
      }
      
      setUploadProgress({ current: totalDates + 1, total: totalDates + 1, currentDate: 'Abgeschlossen!' });
      
      setJsonData(null);
      setFullJsonData(null);
      setAvailableDates([]);
      setSelectedPeriod("");
      setEventDate("");
      setError("");
      
      setTimeout(() => {
        alert(`Alle Spieler-Ergebnisse wurden erfolgreich aggregiert und hochgeladen!\n\n${globalPlayerMap.size} einzigartige Spieler\n${totalDates} Event-Tage verarbeitet\n\nJeder Spieler erscheint jetzt nur EINMAL in der Liste mit seinen Gesamtpunkten!`);
      }, 500);
      
    } catch (err) {
      console.error("Upload error:", err);
      setError("Fehler beim Hochladen der Ergebnisse: " + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, currentDate: '' });
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
        {fullJsonData && (
          <div className="mb-4">
            <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold text-orange-300 mb-2">Gefundene Event-Daten:</h3>
              <div className="space-y-2">
                {availableDates.map(date => (
                  <div key={date} className="flex justify-between text-sm">
                    <span className="text-white">{date}</span>
                    <span className="text-gray-400">{fullJsonData[date].length} Spieler</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <span className="text-orange-300 font-semibold">
                  Insgesamt: {availableDates.length} Event-Tage
                </span>
              </div>
            </div>
            
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
              disabled={isUploading}
              className={`px-6 py-2 rounded text-white font-semibold transition w-full ${
                isUploading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isUploading 
                ? `Lade hoch... (${uploadProgress.current}/${uploadProgress.total})` 
                : `Alle Event-Daten hochladen (${availableDates.length} Tage)`
              }
            </button>
            
            {/* Fortschrittsanzeige */}
            {isUploading && (
              <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Fortschritt:</span>
                    <span className="text-orange-300">
                      {uploadProgress.current} von {uploadProgress.total} Event-Tagen
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {uploadProgress.currentDate && (
                  <div className="text-sm text-gray-300">
                    Aktuell: <span className="text-orange-300">{uploadProgress.currentDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {jsonData && (
          <div className="bg-gray-800 rounded p-4 text-sm overflow-x-auto max-h-96">
            <h3 className="text-lg font-semibold text-orange-300 mb-2">Vorschau (erstes Datum: {eventDate}):</h3>
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