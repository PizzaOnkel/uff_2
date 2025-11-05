// Debug: Warum bekommen Common Chests keine Punkte?

import { calculatePlayerNorms } from './src/utils/logicZentrale.js';
import fs from 'fs';
import path from 'path';

// Helper: lade neueste ChestData_*.json aus public/json-data, fallback auf aktuelle_Punkte-Tabelle*.json
function loadLatestInput() {
  const dir = path.join(process.cwd(), 'public', 'json-data');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  // Priorisiere ChestData_ Dateien
  const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
  if (chestFiles.length > 0) return JSON.parse(fs.readFileSync(path.join(dir, chestFiles[0]), 'utf8'));
  // Fallback: aktuelle_Punkte-Tabelle_*.json
  const alt = files.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse();
  if (alt.length > 0) return JSON.parse(fs.readFileSync(path.join(dir, alt[0]), 'utf8'));
  throw new Error('Keine geeigneten JSON-Eingabedateien gefunden in public/json-data');
}

// Lade Test-Daten
const chestMappings = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const sampleData = loadLatestInput();

console.log("=== COMMON CHEST PUNKTEZUWEISUNG DEBUG ===\n");

// 1. Prüfe ChestMappings für Common Chests
console.log("1. VERFÜGBARE COMMON CHEST MAPPINGS:");
const commonMappings = chestMappings.filter(m => {
  const type = (m.type || m.Type || '').toLowerCase();
  const name = (m.chestName || m.Name || '').toLowerCase();
  const category = (m.category || '').toLowerCase();
  return (type + name + category).includes('common');
});

commonMappings.forEach(m => {
  console.log(`   - ${m.chestName || m.Name}: Level ${m.level || m.Level}, Punkte: ${m.points}, Type: "${m.type || m.Type}", Category: "${m.category || ''}"`);
});

console.log(`\nGefunden: ${commonMappings.length} Common Chest Mappings\n`);

// 2. Teste Sample Common Chest aus CSV
const sampleCommonChest = {
  Name: "Sand Chest",
  Type: "Common Crypt", 
  Level: 15,
  level: 15,
  Points: 0,
  category: ""
};

console.log("2. SAMPLE COMMON CHEST AUS CSV:");
console.log(`   ${sampleCommonChest.Name}, Type: "${sampleCommonChest.Type}", Level: ${sampleCommonChest.Level}`);

// 3. Simuliere das Mapping-Matching
console.log("\n3. MAPPING-MATCHING SIMULATION:");
const level = sampleCommonChest.Level;
const levelStr = String(level).trim();

console.log(`   Suche Level: "${levelStr}"`);

const matchingMappings = chestMappings.filter(m => {
  const mType = (m.type || m.Type || '').trim().toLowerCase();
  const mName = (m.chestName || m.Name || '').trim().toLowerCase(); 
  const mCategory = (m.category || '').trim().toLowerCase();
  const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
  
  // Original Matching-Logik
  const isCommon = (mType + mName + mCategory).includes('common');
  const isCryptOrChest = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('chest');
  const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
  
  console.log(`   Prüfe: "${m.chestName || m.Name}" (Type:"${mType}", Category:"${mCategory}", Level:"${mLevel}")`);
  console.log(`     isCommon: ${isCommon}, isCryptOrChest: ${isCryptOrChest}, levelMatch: ${levelMatch}`);
  
  return isCommon && isCryptOrChest && levelMatch;
});

console.log(`\nMatching Ergebnisse: ${matchingMappings.length} gefunden`);
matchingMappings.forEach(m => {
  console.log(`   ✓ ${m.chestName || m.Name}: ${m.points} Punkte`);
});

// 4. Teste spezifisches Sand Chest Mapping
console.log("\n4. SPEZIFISCHES SAND CHEST MAPPING:");
const sandMapping = chestMappings.find(m => {
  const name = (m.chestName || m.Name || '').toLowerCase();
  const level = String(m.level || m.Level || '').trim();
  return name.includes('sand') && level === '15';
});

if (sandMapping) {
  console.log(`   ✓ Gefunden: ${sandMapping.chestName || sandMapping.Name}`);
  console.log(`     Type: "${sandMapping.type || sandMapping.Type}"`);
  console.log(`     Category: "${sandMapping.category || ''}"`);  
  console.log(`     Level: ${sandMapping.level || sandMapping.Level}`);
  console.log(`     Punkte: ${sandMapping.points}`);
} else {
  console.log("   ✗ Kein Sand Chest Level 15 Mapping gefunden");
}

// 5. Teste alternative Matching-Strategien
console.log("\n5. ALTERNATIVE MATCHING-STRATEGIEN:");

// Direkte Name + Level Suche
const directMatch = chestMappings.find(m => {
  const name = (m.chestName || m.Name || '').toLowerCase();
  const level = String(m.level || m.Level || '').trim();
  return name === 'sand chest' && level === '15';
});

console.log(`   Direkte Name+Level Suche: ${directMatch ? '✓ Gefunden' : '✗ Nicht gefunden'}`);

// Type + Level Suche  
const typeMatch = chestMappings.find(m => {
  const type = (m.type || m.Type || '').toLowerCase();
  const level = String(m.level || m.Level || '').trim();
  return type === 'common crypt' && level === '15';
});

console.log(`   Type+Level Suche: ${typeMatch ? '✓ Gefunden' : '✗ Nicht gefunden'}`);