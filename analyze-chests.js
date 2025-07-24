const fs = require('fs');
const path = require('path');

// Alle JSON-Dateien im Ordner public/json-data laden
const jsonDataDir = path.join(__dirname, 'public', 'json-data');
const files = fs.readdirSync(jsonDataDir).filter(file => file.endsWith('.json'));

const chestTypeMap = new Map();

files.forEach(file => {
  const filePath = path.join(jsonDataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`\n📁 Analyzing ${file}:`);
  
  // Durchsuche alle Tage in der Datei
  Object.keys(data).forEach(date => {
    const dayData = data[date];
    if (Array.isArray(dayData)) {
      dayData.forEach(player => {
        if (player.chests && Array.isArray(player.chests)) {
          player.chests.forEach(chest => {
            if (chest.Name && chest.Type) {
              const key = `${chest.Type}|||${chest.Name}`;
              if (!chestTypeMap.has(key)) {
                chestTypeMap.set(key, {
                  type: chest.Type,
                  name: chest.Name,
                  source: chest.Source || 'Unknown',
                  level: chest.Level || 0
                });
              }
            }
          });
        }
      });
    }
  });
});

// Gruppiere nach Type
const groupedByType = {};
chestTypeMap.forEach((value, key) => {
  if (!groupedByType[value.type]) {
    groupedByType[value.type] = [];
  }
  groupedByType[value.type].push(value);
});

console.log('\n🗂️  COMPLETE CHEST TYPE MAPPING:');
console.log('=====================================');

Object.keys(groupedByType).sort().forEach(type => {
  console.log(`\n📦 TYPE: "${type}"`);
  console.log('   CHESTS:');
  
  groupedByType[type].forEach(chest => {
    console.log(`     - Name: "${chest.name}" (Level: ${chest.level})`);
  });
});

console.log('\n\n📋 SIMPLE MAPPING LIST FOR REVIEW:');
console.log('=====================================');
console.log('Original JSON Type → Dashboard Category');
console.log('=====================================');

// Mapping-Vorschläge basierend auf der Analyse
const mappingProposals = {
  // Arena
  "Arena": "Arena Chests",
  "Event 11215 of Olympus": "Arena Chests",
  "Event 11315 of Olympus": "Arena Chests", 
  "Event Trials of Olympus": "Arena Chests",
  
  // Common Chests (Level 5-25)
  "Level 5 Crypt": "Common Chests",
  "Level 10 Crypt": "Common Chests",
  "Level 15 Crypt": "Common Chests",
  "Level 20 Crypt": "Common Chests",
  "Level 25 Crypt": "Common Chests",
  "Common Crypt": "Common Chests",
  "Level Crypt": "Common Chests",
  
  // Rare Chests (Level 10-30)
  "Level 10 rare Crypt": "Rare Chests",
  "Level 15 rare Crypt": "Rare Chests",
  "Level 20 rare Crypt": "Rare Chests",
  "Level 25 rare Crypt": "Rare Chests",
  "Level 30 rare Crypt": "Rare Chests",
  "rare Crypt": "Rare Chests",
  "Level rare Crypt": "Rare Chests",
  
  // Epic Chests (Level 15-35)
  "Level 15 epic Crypt": "Epic Chests",
  "Level 20 epic Crypt": "Epic Chests",
  "Level 25 epic Crypt": "Epic Chests",
  "Level 30 epic Crypt": "Epic Chests",
  "Level 35 epic Crypt": "Epic Chests",
  "epic Crypt": "Epic Chests",
  
  // Tartaros Chests (Level 10-35)
  "Tartaros Crypt level 10": "Chests of Tartaros",
  "Tartaros Crypt level 15": "Chests of Tartaros",
  "Tartaros Crypt level 20": "Chests of Tartaros",
  "Tartaros Crypt level 25": "Chests of Tartaros",
  "Tartaros Crypt level 30": "Chests of Tartaros",
  "Tartaros Crypt level 35": "Chests of Tartaros",
  
  // Elven Chests (Citadel Level 10-30)
  "Level 10 Citadel": "Elven Chests",
  "Level 15 Citadel": "Elven Chests",
  "Level 20 Citadel": "Elven Chests",
  "Level 25 Citadel": "Elven Chests",
  "Level 30 Citadel": "Elven Chests",
  "Citadel": "Elven Chests",
  "Level Citadel": "Elven Chests",
  
  // Cursed Chests (von Citadel Level 20-25)
  // HINWEIS: Diese kommen auch in "Citadel" Type vor, müssen über Namen erkannt werden
  
  // Bank Chests
  "Bank": "Bank Chests",
  "Clan wealth": "Bank Chests",
  "Clash for the Throne tournament": "Bank Chests",
  "Mercenary Exchange": "Bank Chests",
  
  // Runic Chests
  "Lvl 20-24 Raid Runic squad": "Runic Chests",
  "Lvl 25-29 Raid Runic squad": "Runic Chests",
  "Lvl 30-34 Raid Runic squad": "Runic Chests",
  "Lvl 35-39 Raid Runic squad": "Runic Chests",
  "Lvl 40-44 Raid Runic squad": "Runic Chests",
  "Raid Runic squad": "Runic Chests",
  "Raid Runic sguad": "Runic Chests",
  
  // Heroic Chests
  "heroic Monster": "Heroic Chests",
  
  // Vault of the Ancients
  "Vault of the Ancients": "Vault of the Ancients",
  
  // Quick March Chest & Ancients
  "Rise of the Ancients event": "Quick March Chest", // Enthält beide: Quick March + Ancients
  
  // Epic Ancient squad
  "Epic Ancient squad": "Epic Ancient squad",
  
  // Union
  "Union of Triumph personal reward": "Union Chest",
  
  // Jormungandr
  "Jormungandr Shop": "Jormungandr Chests",
  
  // Spezielle/Sonstige
  "Authority Rush tournament": "Arena Chests", // Oder eigene Kategorie?
  "Mimic Chest": "Bank Chests", // Oder eigene Kategorie?
};

Object.keys(mappingProposals).sort().forEach(originalType => {
  console.log(`"${originalType}" → "${mappingProposals[originalType]}"`);
});

console.log('\n\n🚨 SPECIAL CASES TO CONSIDER:');
console.log('=====================================');
console.log('1. "Rise of the Ancients event" enthält:');
console.log('   - "Quick March Chest" → "Quick March Chest"');
console.log('   - "Ancients\' Chest" → "Ancients Chest"');
console.log('');
console.log('2. "Citadel" Types enthalten:');
console.log('   - "Elven Citadel Chest" → "Elven Chests"');
console.log('   - "Cursed Citadel Chest" → "Cursed Chests"');
console.log('');
console.log('3. Mögliche neue Kategorien:');
console.log('   - "Authority Rush tournament" → eigene Kategorie?');
console.log('   - "Mimic Chest" → eigene Kategorie?');
console.log('   - "Mercenary Exchange" → eigene Kategorie?');

console.log('\n\n📊 SUMMARY:');
console.log('=====================================');
console.log(`Total Original Types: ${Object.keys(groupedByType).length}`);
console.log(`Mapped to Dashboard Categories: ${Object.keys(mappingProposals).length}`);
console.log(`Unmapped Types: ${Object.keys(groupedByType).length - Object.keys(mappingProposals).length}`);

const unmappedTypes = Object.keys(groupedByType).filter(type => !mappingProposals[type]);
if (unmappedTypes.length > 0) {
  console.log('\n🔍 UNMAPPED TYPES:');
  unmappedTypes.forEach(type => {
    console.log(`   - "${type}"`);
  });
}
