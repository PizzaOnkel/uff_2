// Test-Admin erstellen
// Führe diesen Code in der Browser-Console aus oder als separates Script

import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

async function createTestAdmin() {
  try {
    const testAdmin = {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'superAdmin',
      status: 'active',
      createdAt: new Date().toISOString(),
      requestedRole: 'superAdmin'
    };

    const docRef = await addDoc(collection(db, 'admins'), testAdmin);
    console.log('✅ Test-Admin erstellt mit ID:', docRef.id);
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Passwort: admin123');
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Test-Admins:', error);
  }
}

createTestAdmin();
