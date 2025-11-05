const fs = require('fs');

// Lade ChestMappings
const chestMappingsData = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingsData.mappings || chestMappingsData.ChestMappings || chestMappingsData;

// Test Rare Dragon Chest
const chest = {
  Name: "Rare Dragon Chest",
  Type: "Level 25 rare Crypt",
  Source: "Level 25 rare Crypt",
  Level: 25
};

console.log("=== SCORING DEBUG ===");
console.log(`Input: Name="${chest.Name}", Type="${chest.Type}", Source="${chest.Source}", Level=${chest.Level}`);

const typeB = (chest.Type || "").trim().toLowerCase();
const nameB = (chest.Name || "").trim().toLowerCase();
const categoryB = (chest.category || "").trim().toLowerCase();
const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
const levelB = String(chest.Level).toLowerCase();

console.log(`Normalized: typeB="${typeB}", nameB="${nameB}", categoryB="${categoryB}", sourceB="${sourceB}", levelB="${levelB}"`);

// Finde die "Rare Dragon Chest" Mappings
const rareDragonMappings = chestMappings.filter(m => {
  const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
  return nameA.includes("rare dragon");
});

console.log(`\nFound ${rareDragonMappings.length} Rare Dragon mappings:`);

rareDragonMappings.forEach((m, i) => {
  const typeA = (m.type || m.Type || "").trim().toLowerCase();
  const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
  const categoryA = (m.category || "").trim().toLowerCase();
  const sourceA = (m.source || m.Source || "").trim().toLowerCase();
  const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
  
  console.log(`\n${i+1}. Mapping: "${m.chestName}" (type="${m.type}", points=${m.points}, level=${m.levelStart})`);
  console.log(`   Normalized: nameA="${nameA}", typeA="${typeA}", categoryA="${categoryA}", sourceA="${sourceA}", levelA="${levelA}"`);
  
  // Exakte Matching-Logik wie in logicZentrale.js
  let score = 0;
  let matches = true;
  
  // Name-Match Test
  const nameMatch = nameA && nameA === nameB;
  if (nameMatch) score++;
  console.log(`   nameMatch: "${nameA}" === "${nameB}" → ${nameMatch} (score: ${nameMatch ? 1 : 0})`);
  
  // Type-Match Test  
  const typeMatch = typeA && typeA === typeB;
  if (typeMatch) score++;
  console.log(`   typeMatch: "${typeA}" === "${typeB}" → ${typeMatch} (score: ${typeMatch ? 1 : 0})`);
  
  // Source-Match Test
  const sourceMatch = sourceA && sourceA === sourceB;
  if (sourceMatch) score++;
  console.log(`   sourceMatch: "${sourceA}" === "${sourceB}" → ${sourceMatch} (score: ${sourceMatch ? 1 : 0})`);
  
  // Level-Match Test
  const levelMatch = levelA && (levelA === levelB || m.levelEnd === levelB);
  if (levelMatch) score++;
  console.log(`   levelMatch: "${levelA}" === "${levelB}" || ${m.levelEnd} === "${levelB}" → ${levelMatch} (score: ${levelMatch ? 1 : 0})`);
  
  // Failure conditions (aus logicZentrale.js)
  if (nameA && nameA !== nameB) {
    matches = false;
    console.log(`   ❌ FAIL: nameA="${nameA}" !== nameB="${nameB}"`);
  }
  if (typeA && typeA !== typeB) {
    matches = false;
    console.log(`   ❌ FAIL: typeA="${typeA}" !== typeB="${typeB}"`);
  }
  if (sourceA && sourceA !== sourceB) {
    matches = false;
    console.log(`   ❌ FAIL: sourceA="${sourceA}" !== sourceB="${sourceB}"`);
  }
  if (levelA && (levelA !== levelB && m.levelEnd !== levelB)) {
    matches = false;
    console.log(`   ❌ FAIL: levelA="${levelA}" !== levelB="${levelB}" && levelEnd="${m.levelEnd}" !== levelB="${levelB}"`);
  }
  
  console.log(`   Total score: ${score}, matches: ${matches}`);
  if (matches && score > 0) {
    console.log(`   ✅ WOULD BE SELECTED as bestMapping!`);
  }
});