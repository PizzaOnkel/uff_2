// Restore Backup Tool
// Dieses Script löscht alle schlechten CSV-Mappings und importiert das Backup

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import fs from 'fs';

// Firebase Config (setze deine Config hier ein)
const firebaseConfig = {
  // Deine Firebase Config hier
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function restoreBackup() {
  console.log('🚀 Starting backup restore...');
  
  // SCHRITT 1: Alle aktuellen (schlechten) Mappings löschen
  console.log('🗑️ Lösche alle aktuellen Mappings...');
  const currentMappings = await getDocs(collection(db, "chestMappings"));
  
  for (const doc of currentMappings.docs) {
    await deleteDoc(doc.ref);
    console.log(`❌ Gelöscht: ${doc.data().chestName}`);
  }
  
  console.log(`✅ ${currentMappings.docs.length} schlechte Mappings gelöscht`);
  
  // SCHRITT 2: Backup laden
  console.log('📂 Lade Backup-Datei...');
  const backupData = JSON.parse(fs.readFileSync('./public/chest_mappings_2025-10-05.json', 'utf8'));
  
  console.log(`📊 Backup enthält ${backupData.mappings.length} Mappings`);
  
  // SCHRITT 3: Backup-Mappings importieren
  console.log('📥 Importiere Backup-Mappings...');
  let imported = 0;
  
  for (const mapping of backupData.mappings) {
    // Bereite Mapping für Firebase vor (entferne id)
    const { id, ...mappingData } = mapping;
    
    await addDoc(collection(db, "chestMappings"), {
      ...mappingData,
      restoredAt: new Date().toISOString()
    });
    
    imported++;
    if (imported % 50 === 0) {
      console.log(`📥 Importiert: ${imported}/${backupData.mappings.length}`);
    }
  }
  
  console.log(`🎉 Backup restore abgeschlossen!`);
  console.log(`📊 ${imported} Mappings erfolgreich wiederhergestellt`);
  console.log(`✅ Deine Common Chests sollten jetzt wieder funktionieren!`);
}

// Script ausführen
restoreBackup().catch(console.error);