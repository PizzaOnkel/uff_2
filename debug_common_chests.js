const fs = require('fs');

// Lade CSV und zähle Common Chests
const csv = fs.readFileSync('./public/json-data/ChestData_2025-10-05_001.csv', 'utf8');
const lines = csv.split('\n');

console.log('=== COMMON CHESTS ANALYSE ===');

// Suche nach Common Chests (Level X Crypt ohne rare/epic/tartaros)
let commonCount = 0;
let examples = [];

lines.forEach(line => {
  if (line.includes('Crypt') && 
      !line.includes('rare') && 
      !line.includes('epic') && 
      !line.includes('tartaros')) {
    commonCount++;
    if (examples.length < 5) {
      examples.push(line);
    }
  }
});

console.log(`Total Common Chests found: ${commonCount}`);
console.log('\nExamples:');
examples.forEach((ex, i) => {
  console.log(`${i+1}. ${ex}`);
});

// Suche speziell nach "Level X Crypt" Pattern
console.log('\n=== LEVEL CRYPT PATTERN ===');
const levelCryptLines = lines.filter(line => 
  line.match(/Level \d+ Crypt/i) && 
  !line.includes('rare') && 
  !line.includes('epic')
);

console.log(`Level X Crypt Count: ${levelCryptLines.length}`);
levelCryptLines.slice(0, 3).forEach((ex, i) => {
  console.log(`${i+1}. ${ex}`);
});