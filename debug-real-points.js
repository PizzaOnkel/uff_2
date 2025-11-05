import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.js';
import { getChestPoints } from './src/utils/logicZentrale.js';

async function testRealChestPoints() {
  console.log('🧪 TESTING REAL getChestPoints...\n');
  
  const mappingsSnapshot = await getDocs(collection(db, 'chestMappings'));
  const chestMappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Test-Chests basierend auf Log-Datei
  const testChests = [
    {
      Type: "Level 20 Rare Crypt",
      Name: "Rare Dragon Chest",
      category: "Rare Chests",
      level: 20
    },
    {
      Type: "Level 25 Epic Crypt", 
      Name: "Epic Dragon Chest",
      category: "Epic Chests",
      level: 25
    },
    {
      Type: "Level 15 Citadel",
      Name: "Elven Citadel Chest", 
      category: "Elven Chests",
      level: 15
    },
    {
      Type: "Level 15 Common Crypt",
      Name: "Orc Chest",
      category: "Common Chests", 
      level: 15
    }
  ];
  
  console.log('TESTING POINT CALCULATION:\n');
  
  testChests.forEach((chest, idx) => {
    console.log(`${idx + 1}. CHEST: "${chest.Name}"`);
    console.log(`   Type: "${chest.Type}"`);
    console.log(`   Category: "${chest.category}"`);
    console.log(`   Level: ${chest.level}`);
    
    const points = getChestPoints(chest, chestMappings);
    console.log(`   Points: ${points} ${points > 0 ? '✅' : '❌'}`);
    
    if (points === 0) {
      // Debug warum keine Punkte
      const categoryMappings = chestMappings.filter(m => 
        (m.category || '').toLowerCase() === chest.category.toLowerCase()
      );
      console.log(`   Found ${categoryMappings.length} category mappings`);
      
      if (categoryMappings.length > 0) {
        console.log(`   Sample mapping: Type="${categoryMappings[0].type || categoryMappings[0].Type}", Level="${categoryMappings[0].levelStart || categoryMappings[0].level || 'No Level'}"`);
      }
    }
    console.log('');
  });
}

testRealChestPoints();