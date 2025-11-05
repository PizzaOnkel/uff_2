const fs = require('fs');
const path = require('path');

// JSON-Daten laden (neueste ChestData_*.json)
const jsonDir = path.join(__dirname, 'public', 'json-data');
const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
const alt = files.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse();
const chosen = chestFiles.length>0 ? chestFiles[0] : (alt.length>0? alt[0] : null);
if(!chosen) { console.error('Keine JSON-Datei gefunden in public/json-data'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(path.join(jsonDir, chosen), 'utf8'));

// Alle eindeutigen Chest-Namen und -Typen sammeln
const chestTypes = new Map();

Object.values(data).forEach(dayData => {
  if (Array.isArray(dayData)) {
    dayData.forEach(player => {
      if (player.chests && Array.isArray(player.chests)) {
        player.chests.forEach(chest => {
          const key = `${chest.Name || 'UNKNOWN'}`;
          const type = chest.Type || 'UNKNOWN';
          const source = chest.Source || 'UNKNOWN';
          const level = chest.Level || chest.level || 'UNKNOWN';
          
          if (!chestTypes.has(key)) {
            chestTypes.set(key, {
              name: chest.Name || 'UNKNOWN',
              types: new Set(),
              sources: new Set(),
              levels: new Set(),
              count: 0
            });
          }
          
          const chestInfo = chestTypes.get(key);
          chestInfo.types.add(type);
          chestInfo.sources.add(source);
          chestInfo.levels.add(level);
          chestInfo.count++;
        });
      }
    });
  }
});

console.log(`=== ALLE CHEST-TYPEN AUS JSON-DATEN (${chestTypes.size} verschiedene) ===\n`);

// Sortiere nach Häufigkeit
const sortedChests = Array.from(chestTypes.entries())
  .sort(([,a], [,b]) => b.count - a.count);

sortedChests.forEach(([name, info]) => {
  console.log(`🗃️  "${name}" (${info.count}x)`);
  console.log(`   Types: ${Array.from(info.types).join(', ')}`);
  console.log(`   Sources: ${Array.from(info.sources).join(', ')}`);
  console.log(`   Levels: ${Array.from(info.levels).sort().join(', ')}`);
  console.log('');
});

console.log(`\n=== ZUSAMMENFASSUNG ===`);
console.log(`Gesamtanzahl verschiedener Chest-Namen: ${chestTypes.size}`);
console.log(`Gesamtanzahl Chests: ${Array.from(chestTypes.values()).reduce((sum, info) => sum + info.count, 0)}`);