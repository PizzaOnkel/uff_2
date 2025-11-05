// Debug-Script das direkt in der Browser-Konsole läuft
// Öffne die Developer Tools (F12) und füge das in die Konsole ein:

console.log('🔍 Starting chest debug analysis...');

// Simuliere einige Test-Chests
const testChests = [
  { Type: 'Level 25 Common Crypt', Name: 'Orc Chest', level: 25 },
  { Type: 'Level 30 Rare Crypt', Name: 'Rare Dragon Chest', level: 30 },
  { Type: 'Level 35 Epic Crypt', Name: 'Epic Dragon Chest', level: 35 },
  { Type: 'Level 20 Citadel', Name: 'Elven Citadel Chest', level: 20 },
  { Type: 'Bank', Name: 'Golden Chest', level: 0, Source: 'Bank' },
  { Type: 'heroic Monster', Name: 'Inferno Chest', Source: 'heroic Monster' }
];

// Test category assignment
testChests.forEach((chest, idx) => {
  // Simulate category assignment logic
  if (!chest.category) {
    const typeNorm = (chest.Type || '').toLowerCase().replace(/^level \d+\s+/, '');
    const sourceLower = (chest.Source || '').toLowerCase();
    
    if (typeNorm.includes('common crypt')) {
      chest.category = 'Common Chests';
    } else if (typeNorm.includes('rare crypt')) {
      chest.category = 'Rare Chests';
    } else if (typeNorm.includes('epic crypt')) {
      chest.category = 'Epic Chests';
    } else if (typeNorm.includes('citadel')) {
      chest.category = 'Elven Chests';
    } else if (typeNorm.includes('bank') || sourceLower.includes('bank')) {
      chest.category = 'Bank Chests';
    } else if (typeNorm.includes('heroic') || sourceLower.includes('heroic')) {
      chest.category = 'Heroic Chests';
    } else {
      chest.category = 'Unknown';
    }
  }
  
  console.log(`${idx + 1}. "${chest.Name}" (${chest.Type}) → Category: "${chest.category}"`);
});

console.log('\n✅ Copy this debug info and paste it back to me!');