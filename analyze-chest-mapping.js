// Script zur Analyse der Truhen-Zuordnung - zeigt welche Truhe in welche Kategorie aggregiert wird
const fs = require('fs');
const path = require('path');

// Pfad zum JSON-Ordner
const jsonDir = 'c:\\Users\\user\\Desktop\\clan-dashboard\\uff_2\\public\\json-data';

// Sammelt alle gefundenen Truhen mit ihren Zuordnungen
const chestMappings = [];
const unknownChests = [];

/**
 * Analysiert eine einzelne Truhe und gibt die Kategorie-Zuordnung zurück
 */
function analyzeChest(chest) {
  const level = chest.Level || 0;
  const typeRaw = (chest.Type || "").toString().toLowerCase();
  const chestNameLower = (chest.Name || "").toString().toLowerCase();
  const sourceLower = (chest.Source || "").toString().toLowerCase();

  // Arena Chests
  if (typeRaw === "arena") {
    return { category: "arena", subcategory: "count", level: "N/A", mapped: true };
  }

  // Common Chests
  if (typeRaw.startsWith("common") || (typeRaw === "" && sourceLower.includes("level") && sourceLower.includes("crypt"))) {
    const key = "lv" + level;
    const validLevels = ["lv5", "lv10", "lv15", "lv20", "lv25"];
    return { 
      category: "common", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Rare Chests
  if (typeRaw.startsWith("rare")) {
    const key = "lv" + level;
    const validLevels = ["lv10", "lv15", "lv20", "lv25", "lv30"];
    return { 
      category: "rare", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Epic Chests
  if (typeRaw.startsWith("epic")) {
    const key = "lv" + level;
    const validLevels = ["lv15", "lv20", "lv25", "lv30", "lv35"];
    return { 
      category: "epic", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Tartaros Crypt
  if (typeRaw.includes("tartaros") || chestNameLower.includes("tartaros")) {
    const key = "lv" + level;
    const validLevels = ["lv15", "lv20", "lv25", "lv30", "lv35"];
    return { 
      category: "tartaros", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Elven Citadel
  if (typeRaw.includes("elven") || chestNameLower.includes("elven citadel")) {
    const key = "lv" + level;
    const validLevels = ["lv10", "lv15", "lv20", "lv25", "lv30"];
    return { 
      category: "elven", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Cursed Citadel
  if (typeRaw.includes("cursed") || chestNameLower.includes("cursed citadel")) {
    const key = "lv" + level;
    const validLevels = ["lv20", "lv25"];
    return { 
      category: "cursed", 
      subcategory: validLevels.includes(key) ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validLevels.includes(key) 
    };
  }

  // Bank Chests
  if (typeRaw === "bank") {
    const map = {
      "wooden chest": "wooden",
      "bronze chest": "bronze",
      "silver chest": "silver",
      "golden chest": "golden",
      "precious chest": "precious",
      "magic chest": "magic"
    };

    for (const key in map) {
      if (chestNameLower.includes(key)) {
        return { category: "bank", subcategory: map[key], level: "N/A", mapped: true };
      }
    }
    return { category: "bank", subcategory: "UNKNOWN_BANK_TYPE", level: "N/A", mapped: false };
  }

  // Runic Squad Raids
  if (typeRaw === "raid runic squad") {
    let subcategory = "INVALID_LEVEL";
    if (level >= 20 && level <= 24) subcategory = "lv20_24";
    else if (level >= 25 && level <= 29) subcategory = "lv25_29";
    else if (level >= 30 && level <= 34) subcategory = "lv30_34";
    else if (level >= 35 && level <= 39) subcategory = "lv35_39";
    else if (level >= 40 && level <= 44) subcategory = "lv40_44";
    else if (level === 45) subcategory = "lv45";
    
    return { 
      category: "runic", 
      subcategory: subcategory, 
      level: level, 
      mapped: subcategory !== "INVALID_LEVEL" 
    };
  }

  // Heroic Monsters
  if (typeRaw === "heroic monster") {
    const key = "lv" + level;
    const validRange = level >= 16 && level <= 45;
    return { 
      category: "heroic", 
      subcategory: validRange ? key : "INVALID_LEVEL", 
      level: level, 
      mapped: validRange 
    };
  }

  // Vault of the Ancients
  if (typeRaw === "vault of the ancients") {
    let subcategory = "INVALID_LEVEL";
    if (level >= 10 && level <= 14) subcategory = "lv10_14";
    else if (level >= 15 && level <= 19) subcategory = "lv15_19";
    else if (level >= 20 && level <= 24) subcategory = "lv20_24";
    else if (level >= 25 && level <= 29) subcategory = "lv25_29";
    else if (level >= 30 && level <= 34) subcategory = "lv30_34";
    else if (level >= 35 && level <= 39) subcategory = "lv35_39";
    else if (level >= 40 && level <= 44) subcategory = "lv40_44";
    
    return { 
      category: "vota", 
      subcategory: subcategory, 
      level: level, 
      mapped: subcategory !== "INVALID_LEVEL" 
    };
  }

  // Rise of the Ancients Event
  if (typeRaw === "rise of the ancients event") {
    let subcategory = "UNKNOWN_ROTA_TYPE";
    if (chestNameLower.includes("quick march")) subcategory = "quick";
    else if (chestNameLower.includes("ancients")) subcategory = "ancients";
    
    return { 
      category: "rota", 
      subcategory: subcategory, 
      level: "N/A", 
      mapped: subcategory !== "UNKNOWN_ROTA_TYPE" 
    };
  }

  // Epic Ancient Squad
  if (typeRaw === "epic ancient squad") {
    return { category: "eas", subcategory: "count", level: "N/A", mapped: true };
  }

  // Union of Triumph Personal Reward
  if (typeRaw === "union of triumph personal reward") {
    return { category: "union", subcategory: "count", level: "N/A", mapped: true };
  }

  // Jormungandr Shop
  if (typeRaw === "jormungandr shop") {
    return { category: "jormungandr", subcategory: "count", level: "N/A", mapped: true };
  }

  // Unbekannte Truhe
  return { category: "UNKNOWN", subcategory: "UNKNOWN", level: level, mapped: false };
}

/**
 * Sammelt alle Truhen aus allen JSON-Dateien
 */
function collectAllChests() {
  const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));
  const chestCollection = new Map(); // Verwendet Map um Duplikate zu vermeiden
  
  console.log(`Analysiere ${files.length} JSON-Dateien...`);
  
  files.forEach(file => {
    const filePath = path.join(jsonDir, file);
    console.log(`Analysiere ${file}...`);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Durchgehe alle Datumseinträge
      Object.keys(data).forEach(date => {
        const entries = data[date];
        
        if (!Array.isArray(entries)) {
          return;
        }
        
        // Durchgehe alle Clanmate-Einträge
        entries.forEach(entry => {
          // Truhen analysieren
          if (entry.chests && Array.isArray(entry.chests)) {
            entry.chests.forEach(chest => {
              const chestKey = `${chest.Type || 'EMPTY'}|${chest.Name || 'EMPTY'}|${chest.Source || 'EMPTY'}|${chest.Level || 0}`;
              
              if (!chestCollection.has(chestKey)) {
                const mapping = analyzeChest(chest);
                chestCollection.set(chestKey, {
                  originalName: chest.Name || 'EMPTY',
                  originalType: chest.Type || 'EMPTY',
                  originalSource: chest.Source || 'EMPTY',
                  originalLevel: chest.Level || 0,
                  ...mapping
                });
              }
            });
          }
        });
      });
    } catch (error) {
      console.error(`Fehler beim Lesen von ${file}:`, error.message);
    }
  });
  
  return Array.from(chestCollection.values());
}

/**
 * Erstellt CSV mit Truhen-Mapping
 */
function createMappingCSV(chests) {
  const headers = [
    'Original Name',
    'Original Type',
    'Original Source',
    'Original Level',
    'Mapped Category',
    'Mapped Subcategory',
    'Level Used',
    'Successfully Mapped',
    'Notes'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  // Sortiere Truhen: zuerst gemappte, dann nicht gemappte
  const sortedChests = chests.sort((a, b) => {
    if (a.mapped && !b.mapped) return -1;
    if (!a.mapped && b.mapped) return 1;
    return a.category.localeCompare(b.category);
  });
  
  sortedChests.forEach(chest => {
    const notes = chest.mapped ? 'OK' : 'NEEDS_MANUAL_MAPPING';
    const row = [
      chest.originalName,
      chest.originalType,
      chest.originalSource,
      chest.originalLevel,
      chest.category,
      chest.subcategory,
      chest.level,
      chest.mapped ? 'YES' : 'NO',
      notes
    ];
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  return csvContent;
}

// Hauptausführung
console.log('=== CHEST MAPPING ANALYSIS ===');
const allChests = collectAllChests();

console.log(`\nGefundene einzigartige Truhen: ${allChests.length}`);

const mappedChests = allChests.filter(chest => chest.mapped);
const unmappedChests = allChests.filter(chest => !chest.mapped);

console.log(`Erfolgreich gemappte Truhen: ${mappedChests.length}`);
console.log(`Nicht gemappte Truhen: ${unmappedChests.length}`);

// CSV erstellen
const csvContent = createMappingCSV(allChests);
const csvPath = path.join(jsonDir, 'chest_mapping_analysis.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`\nCSV-Datei erstellt: ${csvPath}`);

// Zeige Statistiken
console.log('\n=== MAPPING STATISTIKEN ===');
const categoryStats = {};
allChests.forEach(chest => {
  if (!categoryStats[chest.category]) {
    categoryStats[chest.category] = { total: 0, mapped: 0 };
  }
  categoryStats[chest.category].total++;
  if (chest.mapped) {
    categoryStats[chest.category].mapped++;
  }
});

Object.keys(categoryStats).sort().forEach(category => {
  const stats = categoryStats[category];
  console.log(`${category}: ${stats.mapped}/${stats.total} gemappt`);
});

if (unmappedChests.length > 0) {
  console.log('\n=== NICHT GEMAPPTE TRUHEN (Beispiele) ===');
  unmappedChests.slice(0, 10).forEach(chest => {
    console.log(`Name: "${chest.originalName}", Type: "${chest.originalType}", Source: "${chest.originalSource}", Level: ${chest.originalLevel}`);
  });
}

console.log('\n=== MAPPING ANALYSE ABGESCHLOSSEN ===');
