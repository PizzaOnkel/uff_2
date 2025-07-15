// Test für die Tabellendarstellung
console.log("🧪 Testing table data transformation...");

// Simuliere result.chests Struktur aus der Datenbank
const mockResultChests = {
  "Arena Chests": { total: 1 },
  "Common Chests": { 5: 0, 10: 0, 15: 0, 20: 0, 25: 1 },
  "Rare Chests": { 10: 0, 15: 0, 20: 1, 25: 0, 30: 0 },
  "Epic Chests": { 15: 0, 20: 0, 25: 0, 30: 1, 35: 0 },
  "Chests of Tartaros": { 15: 0, 20: 0, 25: 1, 30: 0, 35: 0 },
  "Elven Chests": { 10: 0, 15: 1, 20: 0, 25: 0, 30: 0 },
  "Bank Chests": { "Wooden": 0, "Bronze": 1, "Silver": 0, "Golden": 0, "Precious": 0, "Magic": 0 },
  "Runic Chests": { "20-24": 0, "25-29": 0, "30-34": 1, "35-39": 0, "40-44": 0, "45": 0 },
  "Heroic Chests": { 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 1, 26: 0 },
  "Vault of the Ancients": { "10-14": 0, "15-19": 0, "20-24": 0, "25-29": 1, "30-34": 0, "35-39": 0, "40-44": 0 },
  "ROTA Total": { total: 1 }
};

// Simuliere die Transformation
const chestDetails = [];
if (mockResultChests && typeof mockResultChests === 'object') {
  Object.entries(mockResultChests).forEach(([category, levels]) => {
    if (typeof levels === 'object') {
      Object.entries(levels).forEach(([level, count]) => {
        if (count > 0) {
          chestDetails.push({
            category,
            level: level === 'total' ? '' : level,
            count,
            points: 0
          });
        }
      });
    }
  });
}

console.log("📊 Transformed chestDetails:", chestDetails);

// Simuliere die Tabellendarstellung für "Common Chests" Level 25
const commonChests25 = chestDetails
  .filter(chest => chest.category === "Common Chests" && chest.level === "25")
  .reduce((sum, chest) => sum + (chest.count || 0), 0);

console.log("🔍 Common Chests Level 25:", commonChests25);

// Simuliere die Tabellendarstellung für "Rare Chests" Level 20
const rareChests20 = chestDetails
  .filter(chest => chest.category === "Rare Chests" && chest.level === "20")
  .reduce((sum, chest) => sum + (chest.count || 0), 0);

console.log("🔍 Rare Chests Level 20:", rareChests20);

// Simuliere die Tabellendarstellung für "Arena Chests" (ohne Level)
const arenaChests = chestDetails
  .filter(chest => chest.category === "Arena Chests")
  .reduce((sum, chest) => sum + (chest.count || 0), 0);

console.log("🔍 Arena Chests (total):", arenaChests);
