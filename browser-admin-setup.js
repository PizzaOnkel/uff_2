// BROWSER-CONSOLE ADMIN SETUP
// Öffnen Sie die Anwendung im Browser und drücken Sie F12
// Fügen Sie diesen Code in die Console ein

// Schritt 1: Firebase aus der bereits geladenen Anwendung verwenden
console.log('🔥 Firebase Admin Setup gestartet...');

// Schritt 2: Admin erstellen (funktioniert nur wenn die App geladen ist)
async function createFirstAdmin() {
  try {
    // Verwende die Firebase-Instanz aus der geladenen App
    const { db } = window.firebase || {};
    
    if (!db) {
      console.error('❌ Firebase nicht gefunden! Stellen Sie sicher, dass die App geladen ist.');
      return;
    }

    const adminData = {
      name: 'Super Admin',
      email: 'admin@clan.de',
      password: 'admin123',
      role: 'superAdmin',
      status: 'active',
      createdAt: new Date().toISOString(),
      requestedRole: 'superAdmin'
    };
    
    // Firestore Collection Reference
    const docRef = await window.firebase.addDoc(
      window.firebase.collection(db, 'admins'), 
      adminData
    );
    
    console.log('✅ Admin erfolgreich erstellt!');
    console.log('📧 Email: admin@clan.de');
    console.log('🔑 Passwort: admin123');
    console.log('🎯 Rolle: superAdmin');
    console.log('📄 Firestore ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Fehler beim Admin erstellen:', error);
  }
}

// Schritt 3: Admin erstellen
console.log('Führe createFirstAdmin() aus...');
createFirstAdmin();
