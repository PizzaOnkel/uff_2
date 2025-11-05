const fs = require('fs');

// Test mit korrigiertem Matching
const chestMappings = JSON.parse(fs.readFileSync('public/chest_mappings_2025-10-05.json', 'utf8')).mappings;

const testChest = {
  "Name": "Rare Dragon Chest",
  "Type": "Level 25 rare Crypt", 
  "Source": "Level 25 rare Crypt",
  "Level": 25
};

function normalizeChestName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/[^\w\s]/g, '').trim();
}

console.log(`=== CORRECTED MATCHING TEST ===`);

const nameLower = normalizeChestName(testChest.Name || "");
const typeLower = normalizeChestName(testChest.Type || "");
const sourceLower = normalizeChestName(testChest.Source || "");
const levelB = Number(testChest.Level || 0);

console.log(`Input: Name="${nameLower}", Type="${typeLower}", Source="${sourceLower}", Level=${levelB}`);

// Finde exakte ChestMapping 
const exactMatch = chestMappings.find(m => {
  const nameA = normalizeChestName(m.chestName || m.Name || "");
  const sourceA = normalizeChestName(m.source || m.Source || "");
  const levelA = Number(m.level || m.levelStart || m.Level || 0);
  
  const nameMatch = nameA === nameLower;
  const sourceMatch = sourceA === sourceLower;
  const levelMatch = levelA === levelB;
  
  console.log(`Checking: "${m.chestName}" (type="${m.type}", source="${m.source}", level=${m.levelStart})`);
  console.log(`  nameMatch: ${nameA} === ${nameLower} → ${nameMatch}`);
  console.log(`  sourceMatch: ${sourceA} === ${sourceLower} → ${sourceMatch}`);
  console.log(`  levelMatch: ${levelA} === ${levelB} → ${levelMatch}`);
  console.log(`  MATCH: ${nameMatch && sourceMatch && levelMatch}`);
  console.log('');
  
  return nameMatch && sourceMatch && levelMatch;
});

if (exactMatch) {
  console.log(`✅ FOUND: ${exactMatch.chestName} -> ${exactMatch.category} (${exactMatch.points} pts)`);
} else {
  console.log(`❌ NO EXACT MATCH FOUND`);
}