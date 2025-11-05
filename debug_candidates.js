const fs = require('fs');

// Lade ChestMappings
const chestMappingsData = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
const chestMappings = chestMappingsData.mappings || chestMappingsData.ChestMappings || chestMappingsData;

console.log("ChestMappings type:", typeof chestMappings);
console.log("ChestMappings length:", Array.isArray(chestMappings) ? chestMappings.length : "NOT ARRAY");
if (Array.isArray(chestMappings)) {
  console.log("First mapping:", chestMappings[0]);
}

// Test Rare Dragon Chest
const chest = {
  Name: "Rare Dragon Chest",
  Type: "Level 25 rare Crypt",
  Source: "Level 25 rare Crypt",
  Level: 25
};

console.log("=== CANDIDATE COLLECTION DEBUG ===");
console.log(`Input: Name="${chest.Name}", Type="${chest.Type}", Source="${chest.Source}", Level=${chest.Level}`);

const typeB = (chest.Type || "").trim().toLowerCase();
const nameB = (chest.Name || "").trim().toLowerCase();
const categoryB = (chest.category || "").trim().toLowerCase();
const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
const levelB = String(chest.Level).toLowerCase();

console.log(`Normalized: typeB="${typeB}", nameB="${nameB}", categoryB="${categoryB}", sourceB="${sourceB}", levelB="${levelB}"`);

const candidateMappings = [];

// Direkte Suche nach passenden Mappings
for (const m of chestMappings) {
  const typeA = (m.type || m.Type || "").trim().toLowerCase();
  const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
  const categoryA = (m.category || "").trim().toLowerCase();
  
  // Früher Ausschluss unpassender Mappings
  let couldMatch = false;
  let reasons = [];
  
  if (typeA && typeB && typeA.includes(typeB.substring(0, 8))) {
    couldMatch = true;
    reasons.push(`typeA.includes(typeB.substring(0,8)): "${typeA}".includes("${typeB.substring(0,8)}")`);
  }
  if (nameA && nameB && nameA.includes(nameB.substring(0, 8))) {
    couldMatch = true;
    reasons.push(`nameA.includes(nameB.substring(0,8)): "${nameA}".includes("${nameB.substring(0,8)}")`);
  }
  if (categoryA && categoryB && categoryA.includes(categoryB.substring(0, 8))) {
    couldMatch = true;
    reasons.push(`categoryA.includes(categoryB.substring(0,8)): "${categoryA}".includes("${categoryB.substring(0,8)}")`);
  }
  if (!typeA && !nameA && !categoryA) {
    couldMatch = true;
    reasons.push("Generisches Mapping (alle leer)");
  }
  
  if (couldMatch) {
    candidateMappings.push(m);
    console.log(`✓ CANDIDATE: "${nameA}" (type="${typeA}", category="${categoryA}") - Reasons: ${reasons.join(", ")}`);
  } else {
    // Zeige interessante Failed Matches
    if (nameA.includes("rare") || nameA.includes("dragon") || typeA.includes("rare")) {
      console.log(`✗ REJECTED: "${nameA}" (type="${typeA}", category="${categoryA}") - No matching reason found`);
    }
  }
  
  // Limitiere Kandidaten für Performance
  if (candidateMappings.length > 20) break;
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total candidates found: ${candidateMappings.length}`);
candidateMappings.forEach((m, i) => {
  console.log(`${i+1}. "${m.chestName || m.Name}" (type="${m.type}", category="${m.category}", points=${m.points})`);
});