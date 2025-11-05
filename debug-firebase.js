// Debug-Skript: Firebase Chest-Mappings prüfen
import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export async function checkChestMappings() {
  try {
    console.log('🔍 Checking Firebase chestMappings collection...');
    
    const chestMappingsSnap = await getDocs(collection(db, "chestMappings"));
    const mappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📊 Total chestMappings in Firebase:', mappings.length);
    
    if (mappings.length > 0) {
      console.log('📋 Sample mappings:');
      mappings.slice(0, 5).forEach((mapping, index) => {
        console.log(`${index + 1}.`, {
          name: mapping.chestName || mapping.Name,
          type: mapping.type || mapping.Type,
          category: mapping.category,
          level: mapping.level || mapping.Level,
          points: mapping.points
        });
      });
    } else {
      console.log('⚠️ No chest mappings found in Firebase!');
      console.log('💡 This explains why no points are being calculated.');
    }
    
    return mappings;
  } catch (error) {
    console.error('❌ Error checking chest mappings:', error);
    return [];
  }
}

// Call it in browser console: checkChestMappings();