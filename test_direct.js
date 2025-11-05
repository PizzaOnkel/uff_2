// Test direct categorization from JSON data
function normalizeChestName(name) {
  return name.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

// Test data from actual JSON
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
    "Type": "Level 20 Citadel", 
    "Source": "Level 20 Citadel",
    "Level": 20
  }
];

testChests.forEach(chest => {
  let category = "Unbekannt";
  let nameLower = normalizeChestName(chest.Name || "");
  let typeLower = normalizeChestName(chest.Type || "");
  
  console.log(`\n--- Testing: ${chest.Name} ---`);
  console.log(`nameLower: "${nameLower}"`);
  console.log(`typeLower: "${typeLower}"`);
  
  if (nameLower.includes("rare dragon") && typeLower.includes("rare crypt")) {
    category = "Rare Chests";
    console.log(`✅ MATCH: Rare Dragon + rare Crypt -> ${category}`);
  }
  else if (nameLower.includes("elven citadel") && typeLower.includes("citadel")) {
    category = "Elven Chests";
    console.log(`✅ MATCH: Elven Citadel + Citadel -> ${category}`);
  }
  else if (nameLower.includes("cursed citadel") && typeLower.includes("citadel")) {
    category = "Cursed Chests";
    console.log(`✅ MATCH: Cursed Citadel + Citadel -> ${category}`);
  }
  else {
    console.log(`❌ NO MATCH: category remains ${category}`);
  }
  
  console.log(`Final category: ${category}`);
});