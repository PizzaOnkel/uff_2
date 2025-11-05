const admin = require('firebase-admin');
const fs = require('fs');

// Service Account Key laden
const serviceAccount = require('./serviceAccount.json'); // Passe ggf. den Dateinamen an

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'pizzaonkel-clan'
});

const db = admin.firestore();

async function exportAllCollections() {
  const collections = await db.listCollections();
  const exportData = {};

  for (const col of collections) {
    const snapshot = await col.get();
    exportData[col.id] = [];
    snapshot.forEach(doc => {
      exportData[col.id].push({ id: doc.id, ...doc.data() });
    });
  }

  fs.writeFileSync('public/firestore-export.json', JSON.stringify(exportData, null, 2));
  console.log('Export abgeschlossen! Datei: public/firestore-export.json');
}

exportAllCollections();
