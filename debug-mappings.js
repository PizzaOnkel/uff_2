import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.js';

async function analyzeChestMappings() {
  try {
    console.log('🔍 Analyzing chest mappings...');
    
    const mappingsSnapshot = await getDocs(collection(db, 'chestMappings'));
    const mappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Total mappings: ${mappings.length}`);
    
    // Gruppiere nach Kategorien
    const categories = {};
    mappings.forEach(m => {
      const cat = m.category || 'No Category';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(m);
    });
    
    console.log('\n📋 Categories found:');
    Object.keys(categories).sort().forEach(cat => {
      console.log(`- ${cat}: ${categories[cat].length} mappings`);
      
      // Zeige erste 3 Beispiele
      if (categories[cat].length > 0) {
        categories[cat].slice(0, 3).forEach(m => {
          console.log(`  • ${m.type || m.Type || 'No Type'} (${m.chestName || m.Name || 'No Name'}) = ${m.points || 0} points`);
        });
        if (categories[cat].length > 3) {
          console.log(`  ... und ${categories[cat].length - 3} weitere`);
        }
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error analyzing mappings:', error);
  }
}

analyzeChestMappings();