// Script zum Löschen aller schlechten CSV-Mappings aus Firebase
// Dann greifen automatisch die hardcoded Fallbacks

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Deine Firebase Config hier einfügen
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllChestMappings() {
  console.log('🗑️ Lösche alle CSV-Mappings...');
  
  const snapshot = await getDocs(collection(db, "chestMappings"));
  
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
    console.log(`❌ Gelöscht: ${doc.data().chestName}`);
  }
  
  console.log('✅ Alle schlechten Mappings gelöscht!');
  console.log('🎯 Hardcoded Fallbacks werden jetzt verwendet');
}

deleteAllChestMappings();