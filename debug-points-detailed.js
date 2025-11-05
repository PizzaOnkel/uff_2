import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.js';
import { getChestPoints } from './src/utils/logicZentrale.js';

async function debugChestPointsDetailed() {
  try {
    console.log('🔍 Debugging chest points in detail...');
    
    // Lade Mappings
    const mappingsSnapshot = await getDocs(collection(db, 'chestMappings'));
    const chestMappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📊 Total mappings loaded: ${chestMappings.length}`);
    
    // Lade Results (begrenzt auf 5 für Test)
    const resultsSnapshot = await getDocs(collection(db, 'results'));
    const results = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 5);
    console.log(`📊 Testing with ${results.length} results`);
    
    // Analysiere Chests aus den ersten paar Results
    let testChests = [];
    results.forEach((result, idx) => {
      if (result.chests && Array.isArray(result.chests)) {
        result.chests.slice(0, 3).forEach(chest => {
          // Kategorie-Zuordnung simulieren
          if (!chest.category) {
            const typeNorm = (chest.Type || '').toLowerCase().replace(/^level \d+\s+/, '');
            const sourceLower = (chest.Source || '').toLowerCase();
            
            if (typeNorm.includes('common crypt')) {
              chest.category = 'Common Chests';
            } else if (typeNorm.includes('rare crypt') || typeNorm.includes('rare dragon')) {
              chest.category = 'Rare Chests';
            } else if (typeNorm.includes('epic crypt')) {
              chest.category = 'Epic Chests';
            } else if (typeNorm.includes('elven') || typeNorm.includes('citadel')) {
              chest.category = 'Elven Chests';
            } else if (typeNorm.includes('cursed')) {
              chest.category = 'Cursed Chests';
            } else if (typeNorm.includes('bank')) {
              chest.category = 'Bank Chests';
            } else if (typeNorm.includes('heroic')) {
              chest.category = 'Heroic Chests';
            } else {
              chest.category = chest.Type || 'Unknown';
            }
          }
          
          testChests.push({
            ...chest,
            resultId: result.id,
            resultIndex: idx
          });
        });
      }
    });
    
    console.log(`\n🧪 Testing ${testChests.length} chests for point calculation:\n`);
    
    // Teste jeden Chest
    testChests.forEach((chest, idx) => {
      const points = getChestPoints(chest, chestMappings);
      console.log(`${idx + 1}. Chest: "${chest.Name || 'No Name'}"`);
      console.log(`   Type: "${chest.Type || 'No Type'}"`);
      console.log(`   Category: "${chest.category}"`);
      console.log(`   Level: "${chest.level || chest.Level || 'No Level'}"`);
      console.log(`   Source: "${chest.Source || 'No Source'}"`);
      console.log(`   Points: ${points}`);
      
      if (points === 0 && chest.category !== 'Unknown') {
        console.log(`   ❌ NO POINTS FOUND for category "${chest.category}"`);
        
        // Zeige passende Mappings für Debug
        const categoryMappings = chestMappings.filter(m => 
          (m.category || '').toLowerCase().includes(chest.category.toLowerCase()) ||
          chest.category.toLowerCase().includes((m.category || '').toLowerCase())
        );
        console.log(`   🔍 Found ${categoryMappings.length} potential category mappings:`);
        categoryMappings.slice(0, 3).forEach(m => {
          console.log(`      - ${m.type || m.Type || 'No Type'} | ${m.category} | ${m.points || 0} pts`);
        });
      } else if (points > 0) {
        console.log(`   ✅ POINTS FOUND!`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugChestPointsDetailed();