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

console.log("=== FLEXIBLE TYPE MATCHING TEST ===");
console.log(`Input: Name="${chest.Name}", Type="${chest.Type}", Source="${chest.Source}", Level=${chest.Level}`);

const typeB = (chest.Type || "").trim().toLowerCase();
const nameB = (chest.Name || "").trim().toLowerCase();
const categoryB = (chest.category || "").trim().toLowerCase();
const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
const levelB = String(chest.Level).toLowerCase();

// Teste Level 25 Rare Dragon Mapping
const level25Mapping = chestMappings.find(m => 
  (m.chestName || "").toLowerCase().includes("rare dragon") && 
  (m.levelStart === 25 || m.level === 25)
);

if (level25Mapping) {
  const typeA = (level25Mapping.type || level25Mapping.Type || "").trim().toLowerCase();
  const nameA = (level25Mapping.chestName || level25Mapping.Name || "").trim().toLowerCase();
  const categoryA = (level25Mapping.category || "").trim().toLowerCase();
  const sourceA = (level25Mapping.source || level25Mapping.Source || "").trim().toLowerCase();
  const levelA = String(level25Mapping.levelStart || level25Mapping.level || level25Mapping.Level || level25Mapping.levelEnd || "").trim().toLowerCase();
  
  console.log(`\nLevel 25 Mapping found: "${level25Mapping.chestName}" (points=${level25Mapping.points})`);
  console.log(`   typeA="${typeA}", typeB="${typeB}"`);
  
  // Alte strenge Prüfung
  const oldTypeMatch = typeA && typeA === typeB;
  console.log(`   Old strict match: "${typeA}" === "${typeB}" → ${oldTypeMatch}`);
  
  // Neue flexible Prüfung (wie in der aktualisierten logicZentrale.js)
  const flexibleMatch = !(typeA && typeB && !typeA.includes(typeB.substring(Math.max(0, typeB.length - 15))) && !typeB.includes(typeA));
  console.log(`   New flexible match: ${flexibleMatch}`);
  console.log(`     - typeA.includes(typeB.substring(${Math.max(0, typeB.length - 15)})): "${typeA}".includes("${typeB.substring(Math.max(0, typeB.length - 15))}") → ${typeA.includes(typeB.substring(Math.max(0, typeB.length - 15)))}`);
  console.log(`     - typeB.includes(typeA): "${typeB}".includes("${typeA}") → ${typeB.includes(typeA)}`);
  
  // Test komplette Matching-Logik
  let score = 0;
  let matches = true;
  
  // Scoring
  if (nameA && nameA === nameB) score++;
  if (typeA && typeA === typeB) score++;
  if (sourceA && sourceA === sourceB) score++;
  if (levelA && (levelA === levelB || level25Mapping.levelEnd === levelB)) score++;
  
  // Neue Matching-Bedingungen
  if (nameA && nameA !== nameB) matches = false;
  // Flexible Type-Matching
  if (typeA && typeB && !typeA.includes(typeB.substring(Math.max(0, typeB.length - 15))) && !typeB.includes(typeA)) matches = false;
  if (sourceA && sourceA !== sourceB) matches = false;
  if (levelA && (levelA !== levelB && level25Mapping.levelEnd !== levelB)) matches = false;
  
  console.log(`\n   Final result: score=${score}, matches=${matches}`);
  if (matches && score > 0) {
    console.log(`   ✅ SUCCESS: This mapping would be selected!`);
    console.log(`   Points: ${level25Mapping.points}, Category: ${level25Mapping.category}`);
  } else {
    console.log(`   ❌ FAIL: This mapping would be rejected`);
  }
} else {
  console.log("❌ No Level 25 Rare Dragon mapping found!");
}