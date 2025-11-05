// Test der aktuellen Common Chest Logik

const fs = require('fs');

// Simuliere die normalizeChestName Funktion
function normalizeChestName(name) {
  if (!name || typeof name !== 'string') return '';
  
  let normalized = name.trim().toLowerCase();
  
  // OCR-FEHLER KORREKTUREN (vereinfacht)
  const ocrFixes = {
    '|': '', ' |': '', '| ': '',
    'â€˜': "'", 'â€™': "'", 'Ã¯': 'i', 'ã¯': 'i',
  };
  
  for (const [error, fix] of Object.entries(ocrFixes)) {
    normalized = normalized.replace(new RegExp(error, 'g'), fix);
  }
  
  return normalized
    .replace(/[''`´]/g, "'")
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe') 
    .replace(/ü/g, 'ue')
    .replace(/\s+/g, ' ')
    .trim();
}

// Simuliere stringsMatchTolerant
function stringsMatchTolerant(str1, str2) {
  if (!str1 || !str2) return false;
  
  const norm1 = normalizeChestName(str1);
  const norm2 = normalizeChestName(str2);
  
  if (norm1 === norm2) return true;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  return false;
}

console.log("=== COMMON CHEST LOGIK DEBUG ===\n");

// Lade Daten
const chestMappingFile = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingFile.mappings || [];

console.log(`ChestMappings geladen: ${chestMappings.length} Einträge\n`);

// Test-Chest aus CSV 
const testChest = {
  Name: "Sand Chest",
  Type: "Common Crypt",
  Level: 15,
  level: 15,
  Points: 0,
  category: "Common Chests"  // Wird von der ersten Kategorisierung gesetzt
};

console.log("1. TEST-CHEST:");
console.log(`   Name: "${testChest.Name}"`);
console.log(`   Type: "${testChest.Type}"`);
console.log(`   Level: ${testChest.level}`);
console.log(`   Category: "${testChest.category}"`);
console.log(`   Points: ${testChest.Points}`);

// Simuliere die neue Logik
console.log("\n2. NEUE LOGIK SIMULATION:");

const category = testChest.category;
let points = testChest.Points || 0;
const level = testChest.level;

console.log(`   category === "Common Chests": ${category === "Common Chests"}`);
console.log(`   points === 0: ${points === 0}`);
console.log(`   chestMappings.length > 0: ${chestMappings.length > 0}`);

if (category === "Common Chests" && (points === 0 || points === undefined) && chestMappings.length > 0) {
  console.log("   → Bedingung erfüllt, führe ChestMapping-Suche aus...\n");
  
  const chestNameNormalized = normalizeChestName(testChest.Name || "");
  const chestLevel = Number(level);
  
  console.log(`   chestNameNormalized: "${chestNameNormalized}"`);
  console.log(`   chestLevel: ${chestLevel}`);
  
  // Suche nach Match
  console.log("\n   Prüfe ChestMappings:");
  
  let foundMatch = null;
  let matchCount = 0;
  
  chestMappings.forEach((m, index) => {
    const mName = normalizeChestName(m.chestName || m.Name || "");
    const mCategory = (m.category || '').trim().toLowerCase();
    const mType = (m.type || m.Type || '').trim().toLowerCase();
    const mLevelStart = Number(m.levelStart || 0);
    const mLevelEnd = Number(m.levelEnd || m.levelStart || 0);
    
    const isCommonCategory = mCategory.includes('common');
    const isCommonType = mType.includes('common');
    const nameMatch = stringsMatchTolerant(mName, chestNameNormalized);
    const levelMatch = (chestLevel >= mLevelStart && chestLevel <= mLevelEnd);
    
    if ((isCommonCategory || isCommonType) && nameMatch) {
      matchCount++;
      console.log(`\n   Match ${matchCount}: "${m.chestName || m.Name}"`);
      console.log(`     mName normalized: "${mName}"`);
      console.log(`     mCategory: "${mCategory}"`);
      console.log(`     mType: "${mType}"`);
      console.log(`     levelStart: ${mLevelStart}, levelEnd: ${mLevelEnd}`);
      console.log(`     nameMatch: ${nameMatch}`);
      console.log(`     levelMatch (${chestLevel} >= ${mLevelStart} && ${chestLevel} <= ${mLevelEnd}): ${levelMatch}`);
      console.log(`     points: ${m.points}`);
      
      if (levelMatch && !foundMatch) {
        foundMatch = m;
        console.log(`     ✓ EXAKTER MATCH GEFUNDEN!`);
      }
    }
  });
  
  console.log(`\n   Gesamt gefundene Name-Matches: ${matchCount}`);
  
  if (foundMatch) {
    points = Number(foundMatch.points);
    console.log(`   ✓ FINALE PUNKTEZUWEISUNG: ${points} Punkte`);
    console.log(`   Mapping: "${foundMatch.chestName}" Level ${foundMatch.levelStart}-${foundMatch.levelEnd}`);
  } else {
    console.log(`   ✗ KEIN Level-Match gefunden für Level ${chestLevel}`);
  }
  
} else {
  console.log("   → Bedingung NICHT erfüllt!");
}

console.log(`\n3. ENDERGEBNIS: ${points} Punkte`);