const fs = require('fs');
const path = require('path');

// Test ChestMapping Matching
const jsonDir = path.join(__dirname, 'public', 'json-data');
const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
const chosen = chestFiles.length>0 ? chestFiles[0] : files.filter(f=>f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse()[0];
const chestData = JSON.parse(fs.readFileSync(path.join(jsonDir, chosen), 'utf8'));
const chestMappings = JSON.parse(fs.readFileSync('public/chest_mappings_2025-10-05.json', 'utf8')).mappings;

console.log(`=== CHESTMAPPING MATCHING TEST ===`);
console.log(`ChestMappings geladen: ${chestMappings.length}`);

// Test mit den problematischen Chests
const testChests = [
  {
    "Name": "Rare Dragon Chest",
    "Type": "Level 25 rare Crypt", 
    "Source": "Level 25 rare Crypt",
    "Level": 25
  },
  {
    "Name": "Elven Citadel Chest",
    "Type": "Level 20 Citadel",
    "Source": "Level 20 Citadel", 
    "Level": 20
  },
  {
    "Name": "Cursed Citadel Chest",
    "Type": "Level 25 Citadel",
    "Source": "Level 25 Citadel",
    "Level": 25
  }
];

function normalizeChestName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/[^\w\s]/g, '').trim();
}

testChests.forEach(chest => {
  console.log(`\n--- Testing: ${chest.Name} ---`);
  
  const nameLower = normalizeChestName(chest.Name || "");
  const typeLower = normalizeChestName(chest.Type || "");
  const sourceLower = normalizeChestName(chest.Source || "");
  const levelB = Number(chest.Level || 0);
  
  console.log(`Input: Name="${nameLower}", Type="${typeLower}", Source="${sourceLower}", Level=${levelB}`);
  
  let bestMapping = null;
  let bestScore = 0;
  
  // ChestMapping Matching Logic (vereinfacht)
  chestMappings.forEach(m => {
    let matches = true;
    let score = 0;
    
    const nameA = normalizeChestName(m.chestName || m.Name || "");
    const typeA = normalizeChestName(m.type || m.Type || "");
    const sourceA = normalizeChestName(m.source || m.Source || "");
    const levelA = Number(m.level || m.levelStart || m.Level || 0);
    
    // Exact matching
    if (nameA && nameA === nameLower) score++;
    if (typeA && typeA === typeLower) score++;
    if (sourceA && sourceA === sourceLower) score++;
    if (levelA && levelA === levelB) score++;
    
    // Check if it's a valid match
    if (nameA && nameA !== nameLower) matches = false;
    if (typeA && typeA !== typeLower) matches = false;
    if (sourceA && sourceA !== sourceLower) matches = false;
    if (levelA && levelA !== levelB) matches = false;
    
    if (matches && score > bestScore) {
      bestScore = score;
      bestMapping = m;
    }
  });
  
  if (bestMapping) {
    console.log(`✅ FOUND bestMapping:`);
    console.log(`   Category: ${bestMapping.category}`);
    console.log(`   Points: ${bestMapping.points}`);
    console.log(`   Match Score: ${bestScore}`);
  } else {
    console.log(`❌ NO bestMapping found`);
    
    // Show potential matches
    console.log(`\nPotential matches for "${chest.Name}":`);
    const potentials = chestMappings.filter(m => {
      const nameA = normalizeChestName(m.chestName || m.Name || "");
      return nameA.includes(nameLower.split(' ')[0]) || nameLower.includes(nameA.split(' ')[0]);
    }).slice(0, 3);
    
    potentials.forEach(p => {
      console.log(`   - "${p.chestName}" -> ${p.category} (${p.points} pts)`);
    });
  }
});