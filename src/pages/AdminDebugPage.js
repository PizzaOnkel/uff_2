import React, { useState, useEffect } from 'react';
import { ROUTES } from '../routes';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { testEmailConfiguration } from '../utils/emailService';
import { sendAdminRequestEmail } from '../utils/emailService';
import { EMAILJS_CONFIG } from '../utils/emailConfig';

const AdminDebugPage = ({ setCurrentPage }) => {
  const [adminRequests, setAdminRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailTest, setEmailTest] = useState(null);
  const [emailTesting, setEmailTesting] = useState(false);
  const [adminEmailTest, setAdminEmailTest] = useState(null);
  const [adminEmailTesting, setAdminEmailTesting] = useState(false);
  const [adminCreation, setAdminCreation] = useState(null);
  const [adminCreating, setAdminCreating] = useState(false);

  useEffect(() => {
    // Admin-Anfragen live überwachen
    const unsub = onSnapshot(collection(db, "adminRequests"), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdminRequests(requests);
      setLoading(false);
    });

    // Admins laden
    const loadAdmins = async () => {
      try {
        const adminsSnapshot = await getDocs(collection(db, "admins"));
        const adminsList = adminsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAdmins(adminsList);
      } catch (error) {
        console.error('Error loading admins:', error);
      }
    };

    loadAdmins();
    return () => unsub();
  }, []);

  const handleTestEmail = async () => {
    setEmailTesting(true);
    try {
      const result = await testEmailConfiguration();
      setEmailTest(result);
    } catch (error) {
      setEmailTest({ success: false, error: error.message });
    }
    setEmailTesting(false);
  };

  const handleTestAdminEmail = async () => {
    setAdminEmailTesting(true);
    try {
      const testAdminData = {
        name: "Test Admin",
        email: "test@example.com",
        clanRole: "Vize-Clanführer",
        reason: "Test-Registrierung zur Überprüfung der E-Mail-Benachrichtigung",
        requestedRole: "Administrator"
      };
      
      const result = await sendAdminRequestEmail(testAdminData);
      setAdminEmailTest(result);
    } catch (error) {
      setAdminEmailTest({ success: false, error: error.message });
    }
    setAdminEmailTesting(false);
  };

  const handleCreateFirstAdmin = async () => {
    setAdminCreating(true);
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
      setAdminCreation({ 
        success: true, 
        message: `Admin erfolgreich erstellt! ID: ${docRef.id}`,
        adminData: adminData
      });
      
      // Admins neu laden
      const adminsSnapshot = await getDocs(collection(db, "admins"));
      const adminsList = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdmins(adminsList);
      
    } catch (error) {
      setAdminCreation({ 
        success: false, 
        error: error.message,
        message: 'Fehler beim Admin erstellen'
      });
    }
    setAdminCreating(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Zurück zum Admin Panel
      </button>

      <h1>🔧 Admin System Debug</h1>

      {/* E-Mail-Konfiguration */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h2>📧 E-Mail-Konfiguration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Service ID:</strong> {EMAILJS_CONFIG.SERVICE_ID}
          </div>
          <div>
            <strong>Template Contact:</strong> {EMAILJS_CONFIG.TEMPLATE_ID_CONTACT}
          </div>
          <div>
            <strong>Template Admin:</strong> {EMAILJS_CONFIG.TEMPLATE_ID_ADMIN}
          </div>
          <div>
            <strong>Public Key:</strong> {EMAILJS_CONFIG.PUBLIC_KEY}
          </div>
          <div>
            <strong>Empfänger:</strong> {EMAILJS_CONFIG.RECIPIENT_EMAIL}
          </div>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <button
            onClick={handleTestEmail}
            disabled={emailTesting}
            style={{
              padding: '10px 20px',
              backgroundColor: emailTesting ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: emailTesting ? 'not-allowed' : 'pointer'
            }}
          >
            {emailTesting ? 'Sende Test-E-Mail...' : 'Test-E-Mail senden'}
          </button>
          
          <button
            onClick={handleTestAdminEmail}
            disabled={adminEmailTesting}
            style={{
              padding: '10px 20px',
              backgroundColor: adminEmailTesting ? '#9CA3AF' : '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: adminEmailTesting ? 'not-allowed' : 'pointer',
              marginLeft: '10px'
            }}
          >
            {adminEmailTesting ? 'Sende Admin-Test-E-Mail...' : 'Admin-Registrierung E-Mail testen'}
          </button>
          
          <button
            onClick={handleCreateFirstAdmin}
            disabled={adminCreating}
            style={{
              padding: '10px 20px',
              backgroundColor: adminCreating ? '#9CA3AF' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: adminCreating ? 'not-allowed' : 'pointer',
              marginLeft: '10px'
            }}
          >
            {adminCreating ? 'Erstelle Admin...' : 'Ersten Admin erstellen'}
          </button>
          
          {emailTest && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: emailTest.success ? '#D1FAE5' : '#FEE2E2',
              borderRadius: '5px',
              color: emailTest.success ? '#065F46' : '#B91C1C'
            }}>
              {emailTest.success ? 
                '✅ Test-E-Mail erfolgreich gesendet!' : 
                `❌ E-Mail-Fehler: ${emailTest.error}`
              }
            </div>
          )}
          
          {adminEmailTest && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: adminEmailTest.success ? '#D1FAE5' : '#FEE2E2',
              borderRadius: '5px',
              color: adminEmailTest.success ? '#065F46' : '#B91C1C'
            }}>
              {adminEmailTest.success ? 
                '✅ Admin-Registrierung Test-E-Mail erfolgreich gesendet!' : 
                `❌ Admin-E-Mail-Fehler: ${adminEmailTest.error}`
              }
            </div>
          )}
          
          {adminCreation && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: adminCreation.success ? '#D1FAE5' : '#FEE2E2',
              borderRadius: '5px',
              color: adminCreation.success ? '#065F46' : '#B91C1C'
            }}>
              {adminCreation.success ? 
                `✅ ${adminCreation.message}` : 
                `❌ Admin-Erstellung fehlgeschlagen: ${adminCreation.error}`
              }
              {adminCreation.success && adminCreation.adminData && (
                <div style={{ marginTop: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
                  <strong>Login-Daten:</strong><br />
                  📧 Email: {adminCreation.adminData.email}<br />
                  🔑 Passwort: {adminCreation.adminData.password}<br />
                  🎯 Rolle: {adminCreation.adminData.role}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin-Anfragen */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h2>📋 Admin-Anfragen ({adminRequests.length})</h2>
        {loading ? (
          <p>Lade Anfragen...</p>
        ) : adminRequests.length === 0 ? (
          <p>Keine Admin-Anfragen gefunden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#E5E7EB' }}>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>E-Mail</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Clan-Rolle</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Datum</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Begründung</th>
                </tr>
              </thead>
              <tbody>
                {adminRequests.map(request => (
                  <tr key={request.id}>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{request.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{request.email}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{request.clanRole}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        backgroundColor: request.status === 'pending' ? '#FEF3C7' : '#D1FAE5',
                        color: request.status === 'pending' ? '#92400E' : '#065F46'
                      }}>
                        {request.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{formatDate(request.requestDate)}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {request.reason}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vorhandene Admins */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h2>👥 Vorhandene Admins ({admins.length})</h2>
        {admins.length === 0 ? (
          <p>Keine Admins gefunden.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#E5E7EB' }}>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>E-Mail</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Rolle</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #D1D5DB', textAlign: 'left' }}>Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{admin.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{admin.email}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{admin.role}</td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        backgroundColor: admin.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                        color: admin.status === 'active' ? '#065F46' : '#B91C1C'
                      }}>
                        {admin.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #D1D5DB' }}>{formatDate(admin.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug-Informationen */}
      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h2>🐛 Debug-Informationen</h2>
        <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
          <p><strong>Firebase Status:</strong> {loading ? 'Lädt...' : 'Verbunden'}</p>
          <p><strong>Admin-Anfragen Collection:</strong> adminRequests</p>
          <p><strong>Admins Collection:</strong> admins</p>
          <p><strong>Aktuelle Zeit:</strong> {new Date().toLocaleString('de-DE')}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDebugPage;
