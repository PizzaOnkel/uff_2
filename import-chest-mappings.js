// Importiere Mappings aus chest-mapping-overview.csv nach Firestore und schreibe neue Vorschläge
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const csvParse = require('csv-parse/sync');

// Firestore initialisieren (Service Account vorausgesetzt)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const mappingCsvPath = path.join(__dirname, 'chest-mapping-overview.csv');
const jsonDir = path.join(__dirname, 'public', 'json-data');

// 1. CSV einlesen und Mappings in Firestore schreiben
async function importMappings() {
  const csvContent = fs.readFileSync(mappingCsvPath, 'utf8');
  const records = csvParse.parse(csvContent, { columns: true, skip_empty_lines: true, delimiter: ';' });
  for (const row of records) {
    const key = [row.Name, row.Type, row.Level, row.Source].join('|');
    if (!row.Name && !row.Type && !row.Source) continue;
    await db.collection('chestMappings').doc(key).set({
      name: row.Name,
      type: row.Type,
      level: row.Level,
      source: row.Source,
      category: row.category || '',
      points: row.points || '',
      mapping_ok: row.Mapping_OK || ''
    }, { merge: true });
  }
  console.log('Alle Mappings wurden importiert.');
}

// 2. Alle Truhen aus JSONs prüfen und Vorschläge für neue Mappings speichern
async function suggestNewChests() {
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json') && f.startsWith('aktuelle_Punkte-Tabelle'));
  const mappingDocs = await db.collection('chestMappings').get();
  const knownKeys = new Set();
  mappingDocs.forEach(doc => knownKeys.add(doc.id));
  const suggestionSet = new Set();

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) { continue; }
    const allEntries = Array.isArray(data) ? data : Object.values(data).flat();
    for (const entry of allEntries) {
      if (!entry || !entry.chests || !Array.isArray(entry.chests)) continue;
      for (const chest of entry.chests) {
        const name = chest.Name || '';
        const type = chest.Type || '';
        const level = chest.Level || '';
        const source = chest.Source || '';
        const key = [name, type, level, source].join('|');
        if (!knownKeys.has(key) && !suggestionSet.has(key) && (name || type || source)) {
          suggestionSet.add(key);
          await db.collection('chestMappingSuggestions').doc(key).set({
            name, type, level, source
          }, { merge: true });
        }
      }
    }
  }
  console.log('Vorschläge für neue Truhen wurden gespeichert.');
}

(async () => {
  await importMappings();
  await suggestNewChests();
  process.exit(0);
})();
