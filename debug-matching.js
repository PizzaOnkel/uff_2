import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.js';

async function debugMatchingIssue() {
  console.log('🔍 DEBUGGING EXACT MATCHING ISSUE...\n');
  
  const mappingsSnapshot = await getDocs(collection(db, 'chestMappings'));
  const mappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Simuliere eine Rare Chest aus der Log-Datei
  const testChest = {
    Type: "Level 20 Rare Crypt",
    category: "Rare Chests",
    Name: "Some Rare Dragon Chest",
    level: 20
  };
  
  console.log('TEST CHEST:');
  console.log('Original Type:', testChest.Type);
  console.log('Category:', testChest.category);
  console.log('Level:', testChest.level);
  console.log('');
  
  // Simuliere die Normalisierung
  let typeB = testChest.Type.toLowerCase();
  const originalTypeB = typeB;
  typeB = typeB.replace(/^level \d+\s+/, '');
  
  console.log('NORMALIZATION:');
  console.log('Original (lowercase):', originalTypeB);
  console.log('After normalization:', typeB);
  console.log('');
  
  // Finde passende Mappings
  console.log('POTENTIAL MAPPINGS:');
  const rareMappings = mappings.filter(m => (m.category || '').toLowerCase().includes('rare'));
  
  rareMappings.forEach((m, idx) => {
    const typeA = (m.type || m.Type || "").trim().toLowerCase();
    console.log(`${idx + 1}. Mapping Type: "${m.type || m.Type}" (original)`);
    console.log(`   Lowercase: "${typeA}"`);
    console.log(`   Category: "${m.category}"`);
    console.log(`   Points: ${m.points}`);
    console.log(`   Match with "${typeB}"? ${typeA === typeB ? '✅ YES' : '❌ NO'}`);
    console.log('');
  });
  
  // Test auch includes matching
  console.log('INCLUDES MATCHING:');
  rareMappings.forEach((m, idx) => {
    const typeA = (m.type || m.Type || "").trim().toLowerCase();
    const includesMatch = typeA.includes(typeB) || typeB.includes(typeA);
    if (includesMatch) {
      console.log(`✅ INCLUDES MATCH: "${typeA}" <-> "${typeB}"`);
    }
  });
}

debugMatchingIssue();