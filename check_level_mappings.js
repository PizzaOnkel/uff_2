// Prüfe ob es Level-spezifische Mappings gibt

const fs = require('fs');

const chestMappingFile = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingFile.mappings || [];

console.log("=== LEVEL-SPEZIFISCHE MAPPINGS SUCHE ===\n");

// 1. Alle Mappings mit Level-Information
const withLevel = chestMappings.filter(m => {
  const level = m.level || m.Level || m.levelStart || m.levelEnd;
  return level !== undefined && level !== null && level !== '' && level !== 'undefined';
});

console.log(`1. MAPPINGS MIT LEVEL-INFORMATION: ${withLevel.length} von ${chestMappings.length} total\n`);

if (withLevel.length > 0) {
  withLevel.slice(0, 20).forEach(m => {
    console.log(`   ${m.chestName || m.Name}:`);
    console.log(`     Category: "${m.category}"`);
    console.log(`     Level: ${m.level || m.Level || m.levelStart || m.levelEnd}`);  
    console.log(`     Points: ${m.points}`);
    console.log(`     Type: "${m.type || m.Type}"\n`);
  });
}

// 2. Prüfe verschiedene Level-Felder
console.log("\n2. LEVEL-FELD ANALYSE:");
const levelFields = ['level', 'Level', 'levelStart', 'levelEnd'];
levelFields.forEach(field => {
  const count = chestMappings.filter(m => {
    const val = m[field];
    return val !== undefined && val !== null && val !== '' && val !== 'undefined';
  }).length;
  console.log(`   ${field}: ${count} Mappings`);
});

// 3. Beispiele für Bank Chests (die sollten Level haben)
console.log("\n3. BANK CHEST LEVEL-BEISPIELE:");
const bankChests = chestMappings.filter(m => {
  const category = (m.category || '').toLowerCase();
  return category.includes('bank');
});

bankChests.slice(0, 5).forEach(m => {
  console.log(`   ${m.chestName || m.Name}:`);
  console.log(`     levelStart: ${m.levelStart}`);
  console.log(`     levelEnd: ${m.levelEnd}`);
  console.log(`     level: ${m.level}`);
  console.log(`     Level: ${m.Level}`);
  console.log(`     Points: ${m.points}\n`);
});