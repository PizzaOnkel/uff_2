// Debug-Tool für Admin-Anfragen
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const debugAdminRequests = async () => {
  try {
    console.log('🔍 Suche nach Admin-Anfragen...');
    
    // Alle Admin-Anfragen abrufen
    const requestsQuery = query(
      collection(db, 'adminRequests'),
      orderBy('requestDate', 'desc')
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    
    console.log(`📋 Gefundene Admin-Anfragen: ${requestsSnapshot.size}`);
    
    const requests = [];
    requestsSnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data
      });
      console.log(`📄 Anfrage ${doc.id}:`, data);
    });
    
    return {
      success: true,
      count: requestsSnapshot.size,
      requests: requests
    };
    
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Admin-Anfragen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const debugAdminEmailTest = async () => {
  try {
    console.log('📧 Teste E-Mail-Versand für Admin-Anfragen...');
    
    // Test-Daten
    const testData = {
      name: 'Test Admin',
      email: 'test@example.com',
      clanRole: 'Offizier',
      reason: 'Test-Nachricht für Debug-Zwecke',
      requestedRole: 'contentAdmin'
    };
    
    // Import hier, um zirkuläre Abhängigkeiten zu vermeiden
    const { sendAdminRequestEmail } = await import('../utils/emailService');
    
    const result = await sendAdminRequestEmail(testData);
    
    console.log('📧 E-Mail-Test Ergebnis:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ E-Mail-Test fehlgeschlagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
