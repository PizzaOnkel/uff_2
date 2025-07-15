// Test für die neue Chest-Mapping-Funktion

// Beispiel-Chests aus den echten JSON-Daten
const testChests = [
  {
    "Name": "Uncommon Chest of Wealth",
    "Type": "Clan wealth",
    "Source": "Clan wealth",
    "Level": 0
  },
  {
    "Name": "Elven Citadel Chest",
    "Type": "Citadel",
    "Source": "Level 15 Citadel",
    "Level": 15
  },
  {
    "Name": "Barbarian Chest",
    "Type": "Common Crypt",
    "Source": "Level 25 Crypt",
    "Level": 25
  },
  {
    "Name": "Orc Chest",
    "Type": "Rare Crypt",
    "Source": "Level 20 Crypt",
    "Level": 20
  },
  {
    "Name": "Undead Chest",
    "Type": "Epic Crypt",
    "Source": "Level 30 Crypt",
    "Level": 30
  },
  {
    "Name": "Demon Chest",
    "Type": "Tartaros Crypt",
    "Source": "Level 25 Crypt",
    "Level": 25
  },
  {
    "Name": "Arena Chest",
    "Type": "Arena",
    "Source": "Arena",
    "Level": 0
  },
  {
    "Name": "Heroic Chest",
    "Type": "Heroic",
    "Source": "Heroic Mission",
    "Level": 25
  },
  {
    "Name": "Runic Chest",
    "Type": "Runic",
    "Source": "Runic Mission",
    "Level": 32
  },
  {
    "Name": "Vault of the Ancients Chest",
    "Type": "Vault",
    "Source": "Vault Mission",
    "Level": 28
  }
];

// Simuliere die neue convertChests-Funktion
function convertChests(rawChests) {
  if (!rawChests || !Array.isArray(rawChests)) return {};
  
  console.log("🔄 Converting chests:", rawChests.length);
  
  const chestCounts = {
    "Arena Chests": {},
    "Common Chests": { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 },
    "Rare Chests": { 10: 0, 15: 0, 20: 0, 25: 0, 30: 0 },
    "Epic Chests": { 15: 0, 20: 0, 25: 0, 30: 0, 35: 0 },
    "Chests of Tartaros": { 15: 0, 20: 0, 25: 0, 30: 0, 35: 0 },
    "Elven Chests": { 10: 0, 15: 0, 20: 0, 25: 0, 30: 0 },
    "Cursed Chests": { 20: 0, 25: 0 },
    "Bank Chests": { "Wooden": 0, "Bronze": 0, "Silver": 0, "Golden": 0, "Precious": 0, "Magic": 0 },
    "Runic Chests": { "20-24": 0, "25-29": 0, "30-34": 0, "35-39": 0, "40-44": 0, "45": 0 },
    "Heroic Chests": {},
    "Vault of the Ancients": { "10-14": 0, "15-19": 0, "20-24": 0, "25-29": 0, "30-34": 0, "35-39": 0, "40-44": 0 },
    "Quick March Chest": { total: 0 },
    "Ancients Chest": { total: 0 },
    "ROTA Total": { total: 0 },
    "Epic Ancient squad": { total: 0 },
    "EAs Total": { total: 0 },
    "Union Chest": { total: 0 },
    "Union Total": { total: 0 },
    "Jormungandr Chests": { total: 0 },
    "Jormungandr Total": { total: 0 }
  };

  // Initialisiere Heroic Chests (16-45)
  for (let i = 16; i <= 45; i++) {
    chestCounts["Heroic Chests"][i] = 0;
  }

  // Verarbeite jede Truhe
  rawChests.forEach(chest => {
    const chestName = chest.Name;
    const level = chest.Level || 0;
    
    console.log(`📦 Processing chest: ${chestName} (Level: ${level})`);
    
    // Mapping-Logik basierend auf Google Sheets
    if (chestName.includes("Arena")) {
      if (!chestCounts["Arena Chests"].total) chestCounts["Arena Chests"].total = 0;
      chestCounts["Arena Chests"].total++;
    }
    else if (chestName.includes("Common") || chestName.includes("Barbarian")) {
      if (chestCounts["Common Chests"][level] !== undefined) {
        chestCounts["Common Chests"][level]++;
      }
    }
    else if (chestName.includes("Rare") || chestName.includes("Orc")) {
      if (chestCounts["Rare Chests"][level] !== undefined) {
        chestCounts["Rare Chests"][level]++;
      }
    }
    else if (chestName.includes("Epic") || chestName.includes("Undead")) {
      if (chestCounts["Epic Chests"][level] !== undefined) {
        chestCounts["Epic Chests"][level]++;
      }
    }
    else if (chestName.includes("Tartaros") || chestName.includes("Demon")) {
      if (chestCounts["Chests of Tartaros"][level] !== undefined) {
        chestCounts["Chests of Tartaros"][level]++;
      }
    }
    else if (chestName.includes("Elven") || chestName.includes("Elf")) {
      if (chestCounts["Elven Chests"][level] !== undefined) {
        chestCounts["Elven Chests"][level]++;
      }
    }
    else if (chestName.includes("Wealth") || chestName.includes("Bank")) {
      let bankType = "Bronze"; // Uncommon = Bronze
      if (chestName.includes("Uncommon")) bankType = "Bronze";
      else if (chestName.includes("Rare")) bankType = "Silver";
      else if (chestName.includes("Epic")) bankType = "Golden";
      else if (chestName.includes("Legendary")) bankType = "Precious";
      else if (chestName.includes("Magic")) bankType = "Magic";
      
      chestCounts["Bank Chests"][bankType]++;
    }
    else if (chestName.includes("Runic")) {
      let runicLevel = "30-34"; // Level 32 -> "30-34"
      if (level >= 20 && level <= 24) runicLevel = "20-24";
      else if (level >= 25 && level <= 29) runicLevel = "25-29";
      else if (level >= 30 && level <= 34) runicLevel = "30-34";
      else if (level >= 35 && level <= 39) runicLevel = "35-39";
      else if (level >= 40 && level <= 44) runicLevel = "40-44";
      else if (level >= 45) runicLevel = "45";
      
      chestCounts["Runic Chests"][runicLevel]++;
    }
    else if (chestName.includes("Heroic")) {
      if (level >= 16 && level <= 45) {
        chestCounts["Heroic Chests"][level]++;
      }
    }
    else if (chestName.includes("Vault") || chestName.includes("Ancient")) {
      let vaultLevel = "25-29"; // Level 28 -> "25-29"
      if (level >= 10 && level <= 14) vaultLevel = "10-14";
      else if (level >= 15 && level <= 19) vaultLevel = "15-19";
      else if (level >= 20 && level <= 24) vaultLevel = "20-24";
      else if (level >= 25 && level <= 29) vaultLevel = "25-29";
      else if (level >= 30 && level <= 34) vaultLevel = "30-34";
      else if (level >= 35 && level <= 39) vaultLevel = "35-39";
      else if (level >= 40 && level <= 44) vaultLevel = "40-44";
      
      chestCounts["Vault of the Ancients"][vaultLevel]++;
    }
    else {
      console.warn(`⚠️ Unbekannte Truhe: ${chestName} (Level: ${level})`);
    }
  });

  // Berechne Totals
  chestCounts["ROTA Total"].total = 
    Object.values(chestCounts["Vault of the Ancients"]).reduce((sum, count) => sum + count, 0);
  
  chestCounts["EAs Total"].total = 
    (chestCounts["Ancients Chest"].total || 0) + 
    (chestCounts["Epic Ancient squad"].total || 0);
  
  chestCounts["Union Total"].total = chestCounts["Union Chest"].total;
  chestCounts["Jormungandr Total"].total = chestCounts["Jormungandr Chests"].total;

  return chestCounts;
}

// Teste die Funktion
console.log("🧪 Testing convertChests function...");
const result = convertChests(testChests);
console.log("✅ Result:", JSON.stringify(result, null, 2));

// Validiere die Ergebnisse
console.log("\n📊 Validation:");
console.log("Arena Chests:", result["Arena Chests"]);
console.log("Common Chests:", result["Common Chests"]);
console.log("Rare Chests:", result["Rare Chests"]);
console.log("Epic Chests:", result["Epic Chests"]);
console.log("Chests of Tartaros:", result["Chests of Tartaros"]);
console.log("Elven Chests:", result["Elven Chests"]);
console.log("Bank Chests:", result["Bank Chests"]);
console.log("Runic Chests:", result["Runic Chests"]);
console.log("Heroic Chests:", result["Heroic Chests"]);
console.log("Vault of the Ancients:", result["Vault of the Ancients"]);
console.log("ROTA Total:", result["ROTA Total"]);
