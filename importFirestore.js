
// Emulator verwenden (muss ganz oben stehen!)
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key laden (für Emulator reicht ein Dummy, aber du kannst auch deinen echten nehmen)
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'pizzaonkel-clan'
});

const db = admin.firestore();

// Exportierte Daten laden
const data = JSON.parse(fs.readFileSync('public/firestore-export.json', 'utf8'));

async function importData() {
  for (const [collectionName, documents] of Object.entries(data)) {
    const collectionRef = db.collection(collectionName);
    for (const doc of documents) {
      const { id, ...fields } = doc;
      const docRef = collectionRef.doc(id);
      await docRef.set(fields);
      console.log(`Importiert: ${collectionName}/${id}`);
    }
  }
  console.log('Import abgeschlossen!');
}

importData().catch(console.error);
