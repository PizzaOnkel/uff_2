// Dieses Skript extrahiert alle Truhen-Namen, Typen, Level und Quellen aus allen JSON-Dateien im Upload-Ordner
// und schreibt sie als CSV-Datei für Excel.
const fs = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, 'public', 'json-data');
const outFile = path.join(__dirname, 'chest-mapping-overview.csv');


// Alle relevanten JSON-Dateien finden, inkl. aktuelle_Punkte-Tabelle_2025-07-19.json explizit
let files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json') && f.startsWith('aktuelle_Punkte-Tabelle'));
const extraFile = 'aktuelle_Punkte-Tabelle_2025-07-19.json';
if (!files.includes(extraFile) && fs.existsSync(path.join(jsonDir, extraFile))) {
  files.push(extraFile);
}



const chestSet = new Set();

for (const file of files) {
  const filePath = path.join(jsonDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    continue;
  }
  // Die Daten können als Array oder als Objekt mit Datumsschlüsseln vorliegen
  const allEntries = Array.isArray(data)
    ? data
    : Object.values(data).flat();
  for (const entry of allEntries) {
    if (!entry || !entry.chests || !Array.isArray(entry.chests)) continue;
    for (const chest of entry.chests) {
      const name = chest.Name || '';
      const type = chest.Type || '';
      const level = chest.Level || '';
      const source = chest.Source || '';
      const key = [name, type, level, source].join('|');
      chestSet.add(key);
    }
  }
}

// Kategorienamen für Dropdown
const categories = ['event', 'clan', 'special', 'bonus', 'unknown'];

// CSV-Header und Hilfszeile für Dropdown
let csv = '# Kategorien für Dropdown: ' + categories.join(', ') + '\n';
csv += 'Name;Type;Level;Source;category;points;Mapping_OK\n';
for (const key of chestSet) {
  const [name, type, level, source] = key.split('|');
  csv += `${name};${type};${level};${source};;;\n`;
}

fs.writeFileSync(outFile, csv, 'utf8');

console.log('Fertig! Die Datei "chest-mapping-overview.csv" wurde erstellt.');
