const path = require('path');
const fs = require('fs');
// Lade neueste ChestData_*.json aus public/json-data
const jsonDir = path.join(__dirname, '..', 'public', 'json-data');
const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
const dataFile = chestFiles.length > 0 ? chestFiles[0] : (files.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse()[0]);
if (!dataFile) throw new Error('Keine JSON-Datei zum Testen gefunden');
const data = require(path.join(jsonDir, dataFile));
const { calculatePlayerNorms } = require(path.join(__dirname, '..', 'src', 'utils', 'logicZentrale.js'));

// Some projects use ES modules; require should work for .js
(async () => {
  try {
    const playersArr = [];
    const resultsArr = data.results || data;
    const chestMappings = require(path.join(__dirname, '..', 'public', 'chest-mapping.json')) || [];
    const normsArr = [];
    const res = calculatePlayerNorms({ playersArr, resultsArr, chestMappings, normsArr });
    console.log('Sample output (first 5 players):');
    console.log(JSON.stringify(res.slice(0,5), null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
