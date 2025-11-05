import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase.js';

async function analyzeRareMappings() {
  const mappingsSnapshot = await getDocs(collection(db, 'chestMappings'));
  const mappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log('🔍 RARE CHEST MAPPINGS:');
  const rareMappings = mappings.filter(m => (m.category || '').toLowerCase().includes('rare'));
  rareMappings.forEach(m => {
    console.log(`Type: "${m.type || m.Type}" | Category: "${m.category}" | Points: ${m.points}`);
  });
  
  console.log('\n🔍 EPIC CHEST MAPPINGS:');
  const epicMappings = mappings.filter(m => (m.category || '').toLowerCase().includes('epic'));
  epicMappings.forEach(m => {
    console.log(`Type: "${m.type || m.Type}" | Category: "${m.category}" | Points: ${m.points}`);
  });
  
  console.log('\n🔍 CITADEL/ELVEN MAPPINGS:');
  const citadelMappings = mappings.filter(m => 
    (m.category || '').toLowerCase().includes('citadel') ||
    (m.category || '').toLowerCase().includes('elven')
  );
  citadelMappings.forEach(m => {
    console.log(`Type: "${m.type || m.Type}" | Category: "${m.category}" | Points: ${m.points}`);
  });
}

analyzeRareMappings();