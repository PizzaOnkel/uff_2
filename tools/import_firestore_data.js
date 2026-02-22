// Firestore-Import-Skript für JSON-Dateien
// Installiere zuerst: npm install firebase-admin

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const admin = require('firebase-admin');
const fs = require('fs');

// Emulator-Konfiguration
admin.initializeApp({
  projectId: 'pizzaonkel-clan', // Aus .firebaserc
});
const db = admin.firestore();


// Automatischer Import aller JSON-Dateien im Ordner firestore-export
const path = require('path');
const dir = path.join(__dirname, '../firestore-export');
fs.readdirSync(dir)
  .filter(file => file.endsWith('.json') && !file.toLowerCase().includes('metadata'))
  .forEach(file => {
    const collectionName = path.basename(file, '.json');
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    let count = 0;
    for (const [id, doc] of Object.entries(data)) {
      console.log(`Importiere ${collectionName}/${id}:`, doc);
      db.collection(collectionName).doc(id).set(doc)
        .then(() => {
          count++;
          if (count === Object.keys(data).length) {
            console.log(`Fertig: ${collectionName} (${count} Dokumente)`);
          }
        })
        .catch(err => console.error(err));
    }
    if (Object.keys(data).length === 0) {
      console.log(`Warnung: ${collectionName} ist leer!`);
    }
  });
