// Skript zum Anlegen von Mapping-Einträgen NUR für common chests in Firestore
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

// Nur common chest Levelbereiche
const mappings = [
  { category: "common", levelStart: 5, levelEnd: 9, points: 1 },
  { category: "common", levelStart: 10, levelEnd: 14, points: 2 },
  { category: "common", levelStart: 15, levelEnd: 19, points: 3 },
  { category: "common", levelStart: 20, levelEnd: 24, points: 4 },
  { category: "common", levelStart: 25, levelEnd: 25, points: 5 }
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
  console.log("Nur die common chest Mappings wurden erstellt!");
}

createMappings();
