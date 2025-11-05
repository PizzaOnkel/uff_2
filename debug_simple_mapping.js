// Einfaches Debug ohne Module-Imports

const fs = require('fs');

console.log("=== COMMON CHEST MAPPING DEBUG ===\n");

// Lade ChestMappings
const chestMappingFile = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingFile.mappings || [];

console.log("1. ALLE COMMON-RELATED MAPPINGS:");
const commonMappings = chestMappings.filter(m => {
  const type = (m.type || m.Type || '').toLowerCase();
  const name = (m.chestName || m.Name || '').toLowerCase();
  const category = (m.category || '').toLowerCase();
  return (type + name + category).includes('common');
});

console.log(`Gefunden: ${commonMappings.length} Common Mappings:\n`);
commonMappings.forEach((m, i) => {
  console.log(`${i+1}. Name: "${m.chestName || m.Name}"`);
  console.log(`   Type: "${m.type || m.Type}"`); 
  console.log(`   Category: "${m.category || ''}"`);
  console.log(`   Level: ${m.level || m.Level}`);
  console.log(`   Points: ${m.points}\n`);
});

console.log("2. SPEZIFISCHE SAND CHEST SUCHE:");
const sandChests = chestMappings.filter(m => {
  const name = (m.chestName || m.Name || '').toLowerCase();
  return name.includes('sand');
});

console.log(`Gefunden: ${sandChests.length} Sand Chest Mappings:`);
sandChests.forEach(m => {
  console.log(`   - Level ${m.level || m.Level}: ${m.points} Punkte (Type: "${m.type || m.Type}")`);
});

console.log("\n3. LEVEL 15 MAPPINGS:");
const level15Mappings = chestMappings.filter(m => {
  const level = String(m.level || m.Level || '').trim();
  return level === '15';
});

console.log(`Gefunden: ${level15Mappings.length} Level 15 Mappings:`);
level15Mappings.slice(0, 10).forEach(m => {
  console.log(`   - ${m.chestName || m.Name}: ${m.points} Punkte (Type: "${m.type || m.Type}")`);
});

console.log("\n4. MATCHING-SIMULATION FÜR 'Sand Chest Level 15':");

const testChest = {
  Name: "Sand Chest",
  Type: "Common Crypt",
  level: 15
};

console.log(`Test Chest: "${testChest.Name}", Type: "${testChest.Type}", Level: ${testChest.level}`);

// Simuliere die neue Matching-Logik
const levelStr = String(testChest.level).trim();
const matches = chestMappings.filter(m => {
  const mType = (m.type || m.Type || '').trim().toLowerCase();
  const mName = (m.chestName || m.Name || '').trim().toLowerCase();
  const mCategory = (m.category || '').trim().toLowerCase();
  const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
  
  const isCommon = (mType + mName + mCategory).includes('common');
  const isCryptOrChest = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('chest');
  const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
  
  return isCommon && isCryptOrChest && levelMatch;
});

console.log(`Matching Ergebnisse: ${matches.length}`);
matches.forEach(m => {
  console.log(`   ✓ ${m.chestName || m.Name}: ${m.points} Punkte`);
});

if (matches.length === 0) {
  console.log("   ✗ Keine Matches gefunden!");
  console.log("\n5. DEBUGGING - WARUM KEIN MATCH?");
  
  // Prüfe jeden Common Mapping einzeln
  commonMappings.forEach(m => {
    const mType = (m.type || m.Type || '').trim().toLowerCase();
    const mName = (m.chestName || m.Name || '').trim().toLowerCase();
    const mCategory = (m.category || '').trim().toLowerCase();
    const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
    
    const isCommon = (mType + mName + mCategory).includes('common');
    const isCryptOrChest = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('chest');
    const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
    
    console.log(`\n   Mapping: "${m.chestName || m.Name}"`);
    console.log(`     Combined String: "${mType + mName + mCategory}"`);
    console.log(`     isCommon: ${isCommon}`);
    console.log(`     isCryptOrChest: ${isCryptOrChest}`);
    console.log(`     levelMatch (${mLevel} === ${levelStr}): ${levelMatch}`);
    console.log(`     Final Match: ${isCommon && isCryptOrChest && levelMatch}`);
  });
}