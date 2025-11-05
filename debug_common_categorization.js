const fs = require('fs');

// Test ob Common Chests richtig kategorisiert werden
console.log('=== COMMON CHEST CATEGORIZATION TEST ===');

// Lade CSV
const csv = fs.readFileSync('./public/json-data/ChestData_2025-10-05_001.csv', 'utf8');
const lines = csv.split('\n').slice(1); // Skip header

// Finde ein paar Common Chests
const commonChests = [];
lines.forEach(line => {
  if (line.includes('Common Crypt') && commonChests.length < 5) {
    const parts = line.split(',');
    if (parts.length >= 6) {
      commonChests.push({
        Name: parts[2],
        Level: parseInt(parts[3]) || 0,
        Type: parts[4],
        Points: parseInt(parts[5]) || 0
      });
    }
  }
});

console.log('Sample Common Chests from CSV:');
commonChests.forEach((chest, i) => {
  console.log(`${i+1}. Name="${chest.Name}", Level=${chest.Level}, Type="${chest.Type}", Points=${chest.Points}`);
});

console.log('\n=== PROBLEM ANALYSIS ===');
console.log('1. All Common Chests have Points=0 in source data ❌');
console.log('2. Category field is empty (not "Common Chests") ❌');
console.log('3. ChestMapping must set both category AND points');

console.log('\n=== NEXT DEBUG STEPS ===');
console.log('- Check if logicZentrale.js properly categorizes Common Chests');
console.log('- Check if category="Common Chests" is set correctly');
console.log('- Check if ChestMapping points are applied correctly');