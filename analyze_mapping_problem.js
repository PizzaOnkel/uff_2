// Analyse: Wie sollten ChestMappings wirklich funktionieren?

const fs = require('fs');

console.log("=== CHESTMAPPING-ANALYSE ===\n");

const chestMappingFile = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingFile.mappings || [];

// 1. Prüfe Forgotten Chest in verschiedenen Kategorien
console.log("1. FORGOTTEN CHEST IN VERSCHIEDENEN KATEGORIEN:");
const forgottenChests = chestMappings.filter(m => {
  const name = (m.chestName || m.Name || '').toLowerCase();
  return name.includes('forgotten');
});

const forgottenByCategory = {};
forgottenChests.forEach(m => {
  const category = m.category || 'Unknown';
  if (!forgottenByCategory[category]) {
    forgottenByCategory[category] = [];
  }
  forgottenByCategory[category].push({
    name: m.chestName || m.Name,
    type: m.type || m.Type,
    level: m.level || m.Level,
    points: m.points
  });
});

Object.keys(forgottenByCategory).forEach(category => {
  console.log(`\n   ${category}:`);
  forgottenByCategory[category].forEach(chest => {
    console.log(`     - Level ${chest.level || 'undefined'}: ${chest.points} Punkte (Type: "${chest.type}")`);
  });
});

// 2. Zeige wie ChestMappings strukturiert sind
console.log("\n\n2. CHESTMAPPING-STRUKTUR BEISPIELE:");
console.log("   Beispiele für korrekte Level-spezifische Mappings:\n");

const levelSpecificMappings = chestMappings.filter(m => {
  const level = m.level || m.Level;
  return level !== undefined && level !== null && level !== '';
}).slice(0, 10);

levelSpecificMappings.forEach(m => {
  console.log(`   ${m.chestName || m.Name}:`);
  console.log(`     Category: "${m.category}"`) ;
  console.log(`     Type: "${m.type || m.Type}"`);
  console.log(`     Level: ${m.level || m.Level}`);
  console.log(`     Points: ${m.points}\n`);
});

// 3. Prüfe Common Chests mit Level-Information
console.log("3. COMMON CHESTS MIT LEVEL-INFORMATION:");
const commonWithLevel = chestMappings.filter(m => {
  const category = (m.category || '').toLowerCase();
  const level = m.level || m.Level;
  return category.includes('common') && level !== undefined && level !== null && level !== '';
});

console.log(`Gefunden: ${commonWithLevel.length} Common Chests mit Level-Information:`);
commonWithLevel.forEach(m => {
  console.log(`   - ${m.chestName || m.Name}: Level ${m.level || m.Level} = ${m.points} Punkte`);
});

// 4. Zeige das Problem auf
console.log("\n\n4. DAS PROBLEM:");
console.log("   ✗ Aktuelle Logik: Alle 'Forgotten Chest' bekommen dieselben Punkte");
console.log("   ✓ Richtige Logik: Level-spezifische Punktezuweisung basierend auf ChestMappings");
console.log("\n   Beispiel - Sand Chest Level 15 aus CSV sollte:");
console.log("   1. Category 'Common Chests' erhalten (✓ funktioniert)");  
console.log("   2. Exaktes Mapping suchen: Name='Sand Chest' + Category='Common Chests' + Level=15");
console.log("   3. Spezifische Punkte aus diesem Mapping verwenden");
console.log("   4. NICHT einfach irgendein Sand Chest Mapping nehmen!");