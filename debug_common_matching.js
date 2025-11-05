const fs = require('fs');

// Lade ChestMappings
const chestMappingsData = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingsData.mappings || chestMappingsData.ChestMappings || chestMappingsData;

// Test Sand Chest
const chest = {
  Name: "Sand Chest",
  Type: "Common Crypt", 
  Source: "Level 15 Crypt",
  Level: 15
};

console.log("=== COMMON CHEST MAPPING TEST ===");
console.log(`Input: Name="${chest.Name}", Type="${chest.Type}", Source="${chest.Source}", Level=${chest.Level}`);

const typeB = (chest.Type || "").trim().toLowerCase();
const nameB = (chest.Name || "").trim().toLowerCase();
const categoryB = (chest.category || "").trim().toLowerCase();
const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
const levelB = String(chest.Level).toLowerCase();

console.log(`Normalized: typeB="${typeB}", nameB="${nameB}", categoryB="${categoryB}", sourceB="${sourceB}", levelB="${levelB}"`);

// Suche passende Mappings
const commonMappings = chestMappings.filter(m => 
  (m.category || "").toLowerCase().includes("common") || 
  (m.type || "").toLowerCase().includes("common")
);

console.log(`\nFound ${commonMappings.length} Common ChestMappings:`);

let bestMatch = null;
let bestScore = -1;

commonMappings.forEach((m, i) => {
  const typeA = (m.type || m.Type || "").trim().toLowerCase();
  const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
  const categoryA = (m.category || "").trim().toLowerCase();
  const sourceA = (m.source || m.Source || "").trim().toLowerCase();
  const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
  
  console.log(`\n${i+1}. Mapping: "${m.chestName}" (type="${typeA}", level=${m.levelStart}, points=${m.points})`);
  
  let score = 0;
  
  // Name-Match
  const nameMatch = !nameA || nameA === nameB || nameB.includes(nameA) || nameA.includes(nameB);
  if (nameA && nameA === nameB) score += 2;
  console.log(`   nameMatch: "${nameA}" vs "${nameB}" → ${nameMatch} (score: ${nameA && nameA === nameB ? 2 : 0})`);
  
  // Type-Match  
  const typeMatch = !typeA || typeA === typeB || typeB.includes(typeA) || typeA.includes(typeB);
  if (typeA && typeA === typeB) score += 2;
  console.log(`   typeMatch: "${typeA}" vs "${typeB}" → ${typeMatch} (score: ${typeA && typeA === typeB ? 2 : 0})`);
  
  // Level-Match
  const chestLevel = Number(chest.Level);
  const mappingLevel = Number(m.levelStart || m.level || m.Level || 0);
  const levelMatch = chestLevel === mappingLevel;
  if (levelMatch) score += 2;
  console.log(`   levelMatch: ${chestLevel} === ${mappingLevel} → ${levelMatch} (score: ${levelMatch ? 2 : 0})`);
  
  console.log(`   Total score: ${score}`);
  
  if (nameMatch && typeMatch && levelMatch && score > bestScore) {
    bestScore = score;
    bestMatch = m;
  }
});

if (bestMatch) {
  console.log(`\n✅ BEST MATCH FOUND: "${bestMatch.chestName}" (points=${bestMatch.points})`);
} else {
  console.log(`\n❌ NO MATCHING FOUND - Common Chest would get 0 points`);
}