// Test-Datei für Firebase-Verbindung
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Test-Funktion für Admin-Registrierung
export const testAdminRegistration = async (testData) => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test 1: Prüfe Verbindung zur admins-Collection
    const adminsSnapshot = await getDocs(collection(db, "admins"));
    console.log('Admins collection accessible:', !adminsSnapshot.empty);
    console.log('Number of existing admins:', adminsSnapshot.size);
    
    // Test 2: Versuche ein Test-Dokument zu erstellen
    const testDoc = await addDoc(collection(db, "adminRequests"), {
      ...testData,
      test: true,
      timestamp: new Date().toISOString()
    });
    
    console.log('Test document created successfully:', testDoc.id);
    return { success: true, id: testDoc.id };
    
  } catch (error) {
    console.error('Firebase test failed:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Test-Funktion für die Komponente
export const debugAdminRegistration = () => {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    clanRole: "Mitglied",
    reason: "Test-Registrierung",
    password: "test123",
    status: "pending",
    requestDate: new Date().toISOString(),
    requestedRole: "contentAdmin"
  };
  
  return testAdminRegistration(testData);
};
