// Script zur Analyse der Truhen-Aggregierung basierend auf dem Google Apps Script
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase-Konfiguration aus src/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDsh7jXiFXIgCPRIXh0PNpFhhsshS4pLmE",
  authDomain: "pizzaonkel-clan.firebaseapp.com",
  projectId: "pizzaonkel-clan",
  storageBucket: "pizzaonkel-clan.firebasestorage.app",
  messagingSenderId: "77478212384",
  appId: "1:77478212384:web:d240b46780e96d65a51d45",
  measurementId: "G-XPBX8KGGRZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Pfad zum JSON-Ordner
const jsonDir = 'c:\\Users\\user\\Desktop\\clan-dashboard\\uff_2\\public\\json-data';

/**
 * Initialisiert die Datenstruktur für einen Spieler.
 * Entspricht der initializePlayerData Funktion aus dem Google Apps Script.
 */
function initializePlayerData() {
  const heroicLevels = Array.from({ length: 30 }, (_, i) => 16 + i); // 16 bis 45
  
  return {
    arena: { count: 0, total: 0 },
    common: { lv5: 0, lv10: 0, lv15: 0, lv20: 0, lv25: 0, total: 0 },
    rare: { lv10: 0, lv15: 0, lv20: 0, lv25: 0, lv30: 0, total: 0 },
    epic: { lv15: 0, lv20: 0, lv25: 0, lv30: 0, lv35: 0, total: 0 },
    tartaros: { lv15: 0, lv20: 0, lv25: 0, lv30: 0, lv35: 0, total: 0 },
    elven: { lv10: 0, lv15: 0, lv20: 0, lv25: 0, lv30: 0, total: 0 },
    cursed: { lv20: 0, lv25: 0, total: 0 },
    bank: { wooden: 0, bronze: 0, silver: 0, golden: 0, precious: 0, magic: 0, total: 0 },
    runic: { lv20_24: 0, lv25_29: 0, lv30_34: 0, lv35_39: 0, lv40_44: 0, lv45: 0, total: 0 },
    heroic: Object.fromEntries(heroicLevels.map(lv => ["lv" + lv, 0])),
    heroic_total: 0,
    vota: { lv10_14: 0, lv15_19: 0, lv20_24: 0, lv25_29: 0, lv30_34: 0, lv35_39: 0, lv40_44: 0, lv45: 0, total: 0 },
    rota: { quick: 0, ancients: 0, total: 0 },
    eas: { count: 0, total: 0 },
    union: { count: 0, total: 0 },
    jormungandr: { count: 0, total: 0 },
    points: 0,
    participation: 0
  };
}

/**
 * Verarbeitet eine einzelne Truhe - entspricht der processChest Funktion aus dem Google Apps Script.
 */
function processChest(playerData, chest) {
  const level = chest.Level || 0;
  // Alle relevanten Felder in Kleinbuchstaben und getrimmt
  let typeRaw = (chest.Type || "").toString().toLowerCase().trim();
  const chestNameLower = (chest.Name || "").toString().toLowerCase().trim();
  const sourceLower = (chest.Source || "").toString().toLowerCase().trim();
  // NEU: Kategorie aus Type extrahieren (z. B. 'common chests', 'common crypt', 'common chest' -> 'common')
  function normalizeCategory(typeStr) {
    typeStr = typeStr.toLowerCase().trim();
    if (typeStr.startsWith("common")) return "common";
    if (typeStr.startsWith("rare")) return "rare";
    if (typeStr.startsWith("epic")) return "epic";
    if (typeStr.startsWith("tartaros")) return "tartaros";
    if (typeStr.startsWith("elven")) return "elven";
    if (typeStr.startsWith("cursed")) return "cursed";
    if (typeStr.startsWith("runic")) return "runic";
    if (typeStr.startsWith("heroic")) return "heroic";
    if (typeStr.startsWith("vota")) return "vota";
    return typeStr;
  }
  typeRaw = normalizeCategory(typeRaw);

  // Mapping wird jetzt global geladen
  const mapping = global.chestMappingCache || [];

  // --- NEU: Nur Chests mit Mapping-Treffer zählen und punkten ---
  // NEU: Für Level-Kategorien (common, rare, epic, tartaros, elven, cursed, runic, heroic, vota):
  // Wenn Mapping-Eintrag mit chestName 'default' existiert, wird dieser verwendet
  const levelCategories = ["common", "rare", "epic", "tartaros", "elven", "cursed", "runic", "heroic", "vota"];
  let foundMapping = null;
  if (levelCategories.some(cat => typeRaw === cat)) {
    foundMapping = mapping.find(m => {
      const isDefault = m.chestName.trim().toLowerCase() === "default";
      // NEU: Kategorievergleich: Normalisiere auch die Mapping-Kategorie
      const mapCatNorm = normalizeCategory(m.category || "");
      const categoryMatch = mapCatNorm === typeRaw;
      const levelMatch = m.levelStart <= level && m.levelEnd >= level;
      return isDefault && categoryMatch && levelMatch;
    });
  }
  // Falls kein Default-Mapping gefunden, normales Mapping nach Name
  if (!foundMapping) {
    foundMapping = mapping.find(m => {
      const mapName = m.chestName.replace(/\s+/g, '').toLowerCase();
      const chestNameNorm = chestNameLower.replace(/\s+/g, '');
      const nameMatch = mapName === chestNameNorm || chestNameNorm.includes(mapName) || mapName.includes(chestNameNorm);
      const levelMatch = m.levelStart <= level && m.levelEnd >= level;
      return nameMatch && levelMatch;
    });
  }
  if (!foundMapping) return;
  let points = foundMapping.points || 0;
  playerData.points += points;
  chest.points = points;
  // Ausführliches Mapping-Logging
  if (typeRaw.startsWith("common") || typeRaw.startsWith("rare") || typeRaw.startsWith("epic")) {
    console.log(`[MAPPING-COMMON/RARE/EPIC] Chest: Name="${chest.Name}" | Level=${level} | Type="${chest.Type}" | Source="${chest.Source}"`);
    if (foundMapping) {
      console.log(`  -> Mapping gefunden: Name="${foundMapping.chestName}" | Kategorie="${foundMapping.category}" | LevelStart=${foundMapping.levelStart} | LevelEnd=${foundMapping.levelEnd} | Punkte=${foundMapping.points}`);
    } else {
      console.log(`  -> KEIN Mapping gefunden für Name="${chestNameLower}" und Level=${level}`);
    }
  } else {
    console.log(`[MAPPING] Chest: Name="${chest.Name}" | Level=${level} | Type="${chest.Type}" | Source="${chest.Source}"`);
    if (foundMapping) {
      console.log(`  -> Mapping gefunden: Name="${foundMapping.chestName}" | Kategorie="${foundMapping.category}" | LevelStart=${foundMapping.levelStart} | LevelEnd=${foundMapping.levelEnd} | Punkte=${foundMapping.points}`);
    } else {
      console.log(`  -> KEIN Mapping gefunden für Name="${chestNameLower}" und Level=${level}`);
    }
  }

  // --- Originale Zählung (nur für erlaubte Chests) ---
  // Arena Chests
  if (typeRaw === "arena") {
    playerData.arena.count++;
    playerData.arena.total++;
    return;
  }
  // Common Chests
  if (typeRaw.startsWith("common") || (typeRaw === "" && sourceLower.includes("level") && sourceLower.includes("crypt"))) {
    const key = "lv" + level;
    if (key in playerData.common) {
      playerData.common[key]++;
      playerData.common.total++;
    }
    return;
  }
  // 🟡 NEUE ZUORDNUNG: Level X Crypt ohne Type -> Common
  if (typeRaw === "" && sourceLower.match(/level \d+ crypt$/)) {
    const key = "lv" + level;
    if (key in playerData.common) {
      playerData.common[key]++;
      playerData.common.total++;
    }
    return;
  }
  // Rare Chests
  if (typeRaw.startsWith("rare")) {
    const key = "lv" + level;
    if (key in playerData.rare) {
      playerData.rare[key]++;
      playerData.rare.total++;
    }
    return;
  }

  // 🟡 NEUE ZUORDNUNG: Level X rare Crypt -> Rare
  if (typeRaw === "" && sourceLower.match(/level \d+ rare crypt$/)) {
    const key = "lv" + level;
    if (key in playerData.rare) {
      playerData.rare[key]++;
      playerData.rare.total++;
    }
    return;
  }

  // Epic Chests
  if (typeRaw.startsWith("epic")) {
    const key = "lv" + level;
    if (key in playerData.epic) {
      playerData.epic[key]++;
      playerData.epic.total++;
    }
    return;
  }

  // 🟡 NEUE ZUORDNUNG: Level X epic Crypt -> Epic
  if (typeRaw === "" && sourceLower.match(/level \d+ epic crypt$/)) {
    const key = "lv" + level;
    if (key in playerData.epic) {
      playerData.epic[key]++;
      playerData.epic.total++;
    }
    return;
  }

  // Tartaros Crypt - Level aus Source extrahieren wenn Level = 0
  if (typeRaw.includes("tartaros") || chestNameLower.includes("tartaros")) {
    let actualLevel = level;
    
    // Wenn Level = 0, versuche es aus der Source zu extrahieren
    if (level === 0) {
      const levelMatch = sourceLower.match(/level (\d+)/);
      if (levelMatch) {
        actualLevel = parseInt(levelMatch[1]);
      }
    }
    
    const key = "lv" + actualLevel;
    if (key in playerData.tartaros) {
      playerData.tartaros[key]++;
      playerData.tartaros.total++;
    }
    return;
  }

  // 🟡 NEUE ZUORDNUNG: Tartaros Crypt level X -> Tartaros
  if (typeRaw === "" && sourceLower.match(/tartaros crypt level \d+$/)) {
    const levelMatch = sourceLower.match(/level (\d+)/);
    if (levelMatch) {
      const actualLevel = parseInt(levelMatch[1]);
      const key = "lv" + actualLevel;
      if (key in playerData.tartaros) {
        playerData.tartaros[key]++;
        playerData.tartaros.total++;
      }
    }
    return;
  }

  // Elven Citadel - Level aus Source extrahieren wenn Level = 0
  if (typeRaw.includes("elven") || chestNameLower.includes("elven citadel") || typeRaw === "level citadel") {
    let actualLevel = level;
    
    // Wenn Level = 0, versuche es aus der Source zu extrahieren
    if (level === 0) {
      const levelMatch = sourceLower.match(/level (\d+)/);
      if (levelMatch) {
        actualLevel = parseInt(levelMatch[1]);
      }
    }
    
    const key = "lv" + actualLevel;
    if (key in playerData.elven) {
      playerData.elven[key]++;
      playerData.elven.total++;
    }
    return;
  }

  // Cursed Citadel
  if (typeRaw.includes("cursed") || chestNameLower.includes("cursed citadel")) {
    const key = "lv" + level;
    if (key in playerData.cursed) {
      playerData.cursed[key]++;
      playerData.cursed.total++;
    }
    return;
  }

  // Bank Chests
  if (typeRaw === "bank") {
    const map = {
      "wooden chest": "wooden",
      "bronze chest": "bronze",
      "silver chest": "silver",
      "golden chest": "golden",
      "precious chest": "precious",
      "magic chest": "magic",
      // OCR-Fehler behalten - keine Korrektur
      "sliver chest": "silver", // OCR-Fehler: "sliver" statt "silver"
      "sliver chest": "silver", // OCR-Fehler-Variante
      "conqueror's chest": "golden" // 🟡 NEUE ZUORDNUNG: Conqueror's Chest -> Golden
    };

    for (const key in map) {
      if (chestNameLower.includes(key)) {
        playerData.bank[map[key]]++;
        playerData.bank.total++;
        return;
      }
    }
  }

  // Runic Squad Raids - auch Tippfehler "sguad" berücksichtigen
  if (typeRaw === "raid runic squad" || typeRaw === "raid runic sguad") {
    const r = playerData.runic;
    if (level >= 20 && level <= 24) r.lv20_24++;
    else if (level >= 25 && level <= 29) r.lv25_29++;
    else if (level >= 30 && level <= 34) r.lv30_34++;
    else if (level >= 35 && level <= 39) r.lv35_39++;
    else if (level >= 40 && level <= 44) r.lv40_44++;
    else if (level === 45) r.lv45++;
    r.total++;
    return;
  }

  // 🟡 NEUE ZUORDNUNG: Runic Chest mit Level-Bereichen aus Source
  if (chestNameLower.includes("runic chest") && sourceLower.includes("raid runic")) {
    const r = playerData.runic;
    if (sourceLower.includes("20-24")) r.lv20_24++;
    else if (sourceLower.includes("25-29")) r.lv25_29++;
    else if (sourceLower.includes("30-34")) r.lv30_34++;
    else if (sourceLower.includes("35-39")) r.lv35_39++;
    else if (sourceLower.includes("40-44")) r.lv40_44++;
    else if (sourceLower.includes("45")) r.lv45++;
    r.total++;
    return;
  }

  // Heroic Monsters
  if (typeRaw === "heroic monster") {
    const key = "lv" + level;
    if (key in playerData.heroic) {
      playerData.heroic[key]++;
      playerData.heroic_total++;
    }
    return;
  }

  // Vault of the Ancients
  if (typeRaw === "vault of the ancients") {
    const v = playerData.vota;
    if (level >= 10 && level <= 14) v.lv10_14++;
    else if (level >= 15 && level <= 19) v.lv15_19++;
    else if (level >= 20 && level <= 24) v.lv20_24++;
    else if (level >= 25 && level <= 29) v.lv25_29++;
    else if (level >= 30 && level <= 34) v.lv30_34++;
    else if (level >= 35 && level <= 39) v.lv35_39++;
    else if (level >= 40 && level <= 44) v.lv40_44++;
    else if (level === 45) v.lv45++;
    v.total++;
    return;
  }

  // Rise of the Ancients Event
  if (typeRaw === "rise of the ancients event") {
    const r = playerData.rota;
    if (chestNameLower.includes("quick march")) r.quick++;
    else if (chestNameLower.includes("ancients")) r.ancients++;
    r.total++;
    return;
  }

  // Epic Ancient Squad
  if (typeRaw === "epic ancient squad") {
    playerData.eas.count++;
    playerData.eas.total++;
    return;
  }

  // 🟡 NEUE ZUORDNUNG: Golden Guardian Epic Chest -> Epic Ancient Squad
  if (chestNameLower.includes("golden guardian epic chest") && typeRaw === "epic ancient squad") {
    playerData.eas.count++;
    playerData.eas.total++;
    return;
  }

  // Union of Triumph Personal Reward
  if (typeRaw === "union of triumph personal reward") {
    playerData.union.count++;
    playerData.union.total++;
    return;
  }

  // Jormungandr Shop
  if (typeRaw === "jormungandr shop") {
    playerData.jormungandr.count++;
    playerData.jormungandr.total++;
    return;
  }

  // Falls keine Kategorie gefunden wurde, logge es für die Analyse
  console.log(`UNBEKANNTE TRUHE: Name="${chest.Name}", Type="${chest.Type}", Source="${chest.Source}", Level=${level}`);
}

/**
 * Aggregiert Daten aus allen JSON-Dateien
 */
async function aggregateAllData() {
  const aggregated = {};
  const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

  // Mapping aus Firestore laden
  async function loadMappingFromFirestore() {
    const snapshot = await getDocs(collection(db, "chestMappings"));
    return snapshot.docs.map(doc => doc.data());
  }

  global.chestMappingCache = await loadMappingFromFirestore();
  // Logging: Wie viele Mapping-Einträge wurden geladen?
  const mappingCount = Array.isArray(global.chestMappingCache) ? global.chestMappingCache.length : 0;
  console.log(`\n=== MAPPING-INFO ===`);
  console.log(`Mapping-Einträge geladen: ${mappingCount}`);
  if (mappingCount > 0) {
    // Zeige die ersten 5 Einträge als Vorschau
    global.chestMappingCache.slice(0, 5).forEach((m, idx) => {
      console.log(`  [${idx+1}] Kategorie: "${m.category}", Name: "${m.chestName}", Level: ${m.levelStart}-${m.levelEnd}, Punkte: ${m.points}`);
    });
  } else {
    console.log("WARNUNG: Keine Mapping-Einträge gefunden! Firestore leer oder offline?");
  }
  console.log(`====================\n`);

  console.log(`Verarbeite ${files.length} JSON-Dateien...`);
  files.forEach(file => {
    const filePath = path.join(jsonDir, file);
    console.log(`Lese ${file}...`);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      Object.keys(data).forEach(date => {
        const entries = data[date];
        if (!Array.isArray(entries)) {
          console.log(`Warnung: Erwartetes Array unter Datum '${date}' in ${file} nicht gefunden.`);
          return;
        }
        entries.forEach(entry => {
          const clanmate = entry.Clanmate || 'UNBEKANNT';
          if (!aggregated[clanmate]) {
            aggregated[clanmate] = initializePlayerData();
          }
          aggregated[clanmate].points += entry.Points || 0;
          aggregated[clanmate].participation++;
          if (entry.chests && Array.isArray(entry.chests)) {
            entry.chests.forEach(chest => {
              processChest(aggregated[clanmate], chest);
            });
          }
        });
      });
    } catch (error) {
      console.error(`Fehler beim Lesen von ${file}:`, error.message);
    }
  });
  return aggregated;
}

/**
 * Erstellt CSV-Header entsprechend dem Google Apps Script
 */
function createCSVHeaders() {
  const heroicHeaders = Array.from({ length: 30 }, (_, i) => `Heroic LV${i + 16}`);
  const votaHeaders = [
    "VotA LV 10-14", "VotA LV 15-19", "VotA LV 20-24", "VotA LV 25-29",
    "VotA LV 30-34", "VotA LV 35-39", "VotA LV 40-44", "VotA LV 45", "VotA Total"
  ];
  return [
    "Clanmate",
    "Arena Chest", "Arena Total",
    "Common LV5", "Common LV10", "Common LV15", "Common LV20", "Common LV25", "Common Total",
    "Rare LV10", "Rare LV15", "Rare LV20", "Rare LV25", "Rare LV30", "Rare Total",
    "Epic LV15", "Epic LV20", "Epic LV25", "Epic LV30", "Epic LV35", "Epic Total",
    "Tartaros LV15", "Tartaros LV20", "Tartaros LV25", "Tartaros LV30", "Tartaros LV35", "Tartaros Total",
    "Elven LV10", "Elven LV15", "Elven LV20", "Elven LV25", "Elven LV30", "Elven Total",
    "Cursed LV20", "Cursed LV25", "Cursed Total",
    "Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest", "Bank Total",
    "Runic LV 20-24", "Runic LV 25-29", "Runic LV 30-34", "Runic LV 35-39", "Runic LV 40-44", "Runic LV 45", "Runic Total",
    ...heroicHeaders, "Heroic Total",
    ...votaHeaders,
    "Quick March Chest", "Ancients Chest", "ROTA Total",
    "Epic Ancient squad", "EAs Total",
    "Union Chest", "Union Total",
    "Jormungandr's Chest", "Jormungandr Total",
    "Points", "", "Timestamp"
  ];
}

/**
 * Konvertiert aggregierte Daten in CSV-Zeilen
 */
function convertToCSVRows(aggregatedData) {
  const rows = [];
  
  const getTimestamp = () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}Z`;
  };
  for (const name in aggregatedData) {
    const d = aggregatedData[name];
    const row = [
      name,
      d.arena.count, d.arena.total,
      d.common.lv5, d.common.lv10, d.common.lv15, d.common.lv20, d.common.lv25, d.common.total,
      d.rare.lv10, d.rare.lv15, d.rare.lv20, d.rare.lv25, d.rare.lv30, d.rare.total,
      d.epic.lv15, d.epic.lv20, d.epic.lv25, d.epic.lv30, d.epic.lv35, d.epic.total,
      d.tartaros.lv15, d.tartaros.lv20, d.tartaros.lv25, d.tartaros.lv30, d.tartaros.lv35, d.tartaros.total,
      d.elven.lv10, d.elven.lv15, d.elven.lv20, d.elven.lv25, d.elven.lv30, d.elven.total,
      d.cursed.lv20, d.cursed.lv25, d.cursed.total,
      d.bank.wooden, d.bank.bronze, d.bank.silver, d.bank.golden, d.bank.precious, d.bank.magic, d.bank.total,
      d.runic.lv20_24, d.runic.lv25_29, d.runic.lv30_34, d.runic.lv35_39, d.runic.lv40_44, d.runic.lv45, d.runic.total,
      ...Object.values(d.heroic), d.heroic_total,
      d.vota.lv10_14, d.vota.lv15_19, d.vota.lv20_24, d.vota.lv25_29, d.vota.lv30_34, d.vota.lv35_39, d.vota.lv40_44, d.vota.lv45, d.vota.total,
      d.rota.quick, d.rota.ancients, d.rota.total,
      d.eas.count, d.eas.total,
      d.union.count, d.union.total,
      d.jormungandr.count, d.jormungandr.total,
      d.points, "", getTimestamp()
    ];
    rows.push(row);
  }
  
  return rows;
}


// Hauptausführung jetzt asynchron
async function main() {
  console.log('=== CHEST AGGREGATION ANALYSIS ===');
  // Aggregation asynchron ausführen
  const aggregatedData = await aggregateAllData();

  console.log(`\nGefundene Spieler: ${Object.keys(aggregatedData).length}`);

  // CSV erstellen
  const headers = createCSVHeaders();
  const rows = convertToCSVRows(aggregatedData);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  // CSV-Datei schreiben
  const csvPath = path.join(jsonDir, 'chest_aggregation_preview.csv');
  fs.writeFileSync(csvPath, csvContent);

  console.log(`\nCSV-Datei erstellt: ${csvPath}`);
  console.log(`\nErste 5 Zeilen der Aggregation:`);
  console.log(headers.slice(0, 10).join(' | '));
  console.log(''.padStart(100, '-'));
  rows.slice(0, 5).forEach(row => {
    console.log(row.slice(0, 10).map(cell => String(cell).padStart(8)).join(' | '));
  });

  console.log('\n=== ANALYSE ABGESCHLOSSEN ===');
}

main();
