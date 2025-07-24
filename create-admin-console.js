// KOPIERE DIESEN CODE IN DIE BROWSER-CONSOLE (F12)

// Schritt 1: Firebase importieren
import { db } from './src/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

// Schritt 2: Admin erstellen
async function createFirstAdmin() {
  try {
    const adminData = {
      name: 'Super Admin',
      email: 'admin@clan.de',
      password: 'admin123',
      role: 'superAdmin',
      status: 'active',
      createdAt: new Date().toISOString(),
      requestedRole: 'superAdmin'
    };
    
    const docRef = await addDoc(collection(db, 'admins'), adminData);
    console.log('✅ Admin erstellt!');
    console.log('📧 Email: admin@clan.de');
    console.log('🔑 Passwort: admin123');
    console.log('🎯 Rolle: superAdmin');
    console.log('📄 ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Fehler:', error);
  }
}

// Schritt 3: Admin erstellen
await createFirstAdmin();
