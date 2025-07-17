// Skript zum automatischen Anlegen aller Chest-Mapping-Einträge in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDsh7jXiFXIgCPRIXh0PNpFhhsshS4pLmE",
  authDomain: "pizzaonkel-clan.firebaseapp.com",
  projectId: "pizzaonkel-clan",
  storageBucket: "pizzaonkel-clan.firebasestorage.app",
  messagingSenderId: "77478212384",
  appId: "1:77478212384:web:d240b46780e96d65a51d45",
  measurementId: "G-XPBX8KGGRZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Kategorien und Levelbereiche
const mappings = [
  // Common
  { category: "common", levelStart: 5, levelEnd: 9, points: 1 },
  { category: "common", levelStart: 10, levelEnd: 14, points: 2 },
  { category: "common", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "common", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "common", levelStart: 25, levelEnd: 25, points: 5 },
  // Rare
  { category: "rare", levelStart: 10, levelEnd: 14, points: 2 },
  { category: "rare", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "rare", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "rare", levelStart: 25, levelEnd: 29, points: 5 },
  { category: "rare", levelStart: 30, levelEnd: 30, points: 6 },
  // Epic
  { category: "epic", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "epic", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "epic", levelStart: 25, levelEnd: 29, points: 5 },
  { category: "epic", levelStart: 30, levelEnd: 34, points: 6 },
  { category: "epic", levelStart: 35, levelEnd: 35, points: 7 },
  // Tartaros
  { category: "tartaros", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "tartaros", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "tartaros", levelStart: 25, levelEnd: 29, points: 5 },
  { category: "tartaros", levelStart: 30, levelEnd: 34, points: 6 },
  { category: "tartaros", levelStart: 35, levelEnd: 35, points: 7 },
  // Elven
  { category: "elven", levelStart: 10, levelEnd: 14, points: 2 },
  { category: "elven", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "elven", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "elven", levelStart: 25, levelEnd: 29, points: 5 },
  { category: "elven", levelStart: 30, levelEnd: 30, points: 6 },
  // Cursed
  { category: "cursed", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "cursed", levelStart: 25, levelEnd: 25, points: 5 },
  // Runic
  { category: "runic", levelStart: 20, levelEnd: 24, points: 5 },
  { category: "runic", levelStart: 25, levelEnd: 29, points: 6 },
  { category: "runic", levelStart: 30, levelEnd: 34, points: 7 },
  { category: "runic", levelStart: 35, levelEnd: 39, points: 8 },
  { category: "runic", levelStart: 40, levelEnd: 44, points: 9 },
  { category: "runic", levelStart: 45, levelEnd: 45, points: 10 },
  // Heroic
  { category: "heroic", levelStart: 16, levelEnd: 45, points: 10 },
  // VotA
  { category: "vota", levelStart: 10, levelEnd: 14, points: 2 },
  { category: "vota", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "vota", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "vota", levelStart: 25, levelEnd: 29, points: 5 },
  { category: "vota", levelStart: 30, levelEnd: 34, points: 6 },
  { category: "vota", levelStart: 35, levelEnd: 39, points: 7 },
  { category: "vota", levelStart: 40, levelEnd: 44, points: 8 },
  { category: "vota", levelStart: 45, levelEnd: 45, points: 9 }
];

async function createMappings() {
  for (const m of mappings) {
    const entry = {
      chestName: "default",
      category: m.category,
      levelStart: m.levelStart,
      levelEnd: m.levelEnd,
      points: m.points
    };
    await addDoc(collection(db, "chestMappings"), entry);
    console.log(`Mapping hinzugefügt: ${JSON.stringify(entry)}`);
  }
  console.log("Alle Mappings wurden erstellt!");
}

createMappings();
