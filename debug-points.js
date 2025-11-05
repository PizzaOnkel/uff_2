// Debug-Skript für Point Calculation System
import { fallbackCategory, getChestPoints, calculatePlayerNorms } from './src/utils/logicZentrale.js';

// Test-Chest von den aktuellen JSON-Daten
const testChest = {
  "Name": "Stone Chest",
  "Type": "Level 25 Common Crypt",
  "Source": "Level 25 Common Crypt",
  "Level": 25
};

// Test Chest-Mappings (aus der CSV)
const testMappings = [
  {
    "chestName": "Stone Chest",
    "type": "Common Crypt",
    "level": 25,
    "source": "Level 25 Crypt",
    "category": "Common Chests",
    "points": 256
  },
  {
    "chestName": "Barbarian Chest",
    "type": "Common Crypt",
    "level": 25,
    "source": "Level 25 Crypt",
    "category": "Common Chests",
    "points": 256
  }
];

console.log('=== DEBUGGING POINT CALCULATION ===');
console.log('Test Chest:', testChest);
console.log('Fallback Category:', fallbackCategory(testChest));
console.log('Points Calculation:', getChestPoints(testChest, testMappings));

// Test für Epic Chest
const testEpicChest = {
  "Name": "Epic Undead Chest",
  "Type": "Level 25 Epic Crypt",
  "Source": "Level 25 Epic Crypt",
  "Level": 25
};

const testEpicMappings = [
  {
    "chestName": "Epic Undead Chest",
    "type": "Epic Crypt",
    "level": 25,
    "source": "Level 25 Epic Crypt",
    "category": "Epic Chests",
    "points": 400
  }
];

console.log('\n=== EPIC CHEST TEST ===');
console.log('Test Epic Chest:', testEpicChest);
console.log('Fallback Category:', fallbackCategory(testEpicChest));
console.log('Points Calculation:', getChestPoints(testEpicChest, testEpicMappings));