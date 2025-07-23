import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Überprüfe, ob Admin in localStorage gespeichert ist
    const storedAdmin = localStorage.getItem('currentAdmin');
    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        // Nur setzen, wenn es ein gültiger Admin ist
        if (admin && admin.id && admin.email && admin.role) {
          setCurrentAdmin(admin);
        } else {
          // Ungültige Daten entfernen
          localStorage.removeItem('currentAdmin');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Admin-Daten:', error);
        localStorage.removeItem('currentAdmin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Prüfe, ob bereits Admins existieren
      const allAdminsQuery = query(collection(db, 'admins'));
      const allAdminsSnapshot = await getDocs(allAdminsQuery);
      
      // Wenn keine Admins existieren, erstelle automatisch einen Super-Admin
      if (allAdminsSnapshot.size === 0) {
        try {
          const { addDoc } = await import('firebase/firestore');
          const emergencyAdmin = {
            name: 'Emergency Admin',
            email: email,
            password: password,
            role: 'superAdmin',
            status: 'active',
            createdAt: new Date().toISOString(),
            requestedRole: 'superAdmin'
          };
          
          const docRef = await addDoc(collection(db, 'admins'), emergencyAdmin);
          
          const admin = {
            id: docRef.id,
            ...emergencyAdmin
          };
          
          setCurrentAdmin(admin);
          localStorage.setItem('currentAdmin', JSON.stringify(admin));
          return { success: true, admin };
        } catch (error) {
          console.error('Fehler beim Erstellen des Emergency-Admins:', error);
          return { success: false, error: 'Fehler beim Erstellen des Emergency-Admins: ' + error.message };
        }
      }
      
      const q = query(
        collection(db, 'admins'),
        where('email', '==', email),
        where('password', '==', password),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data();
        
        const admin = {
          id: querySnapshot.docs[0].id,
          ...adminData
        };
        
        setCurrentAdmin(admin);
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        return { success: true, admin };
      } else {
        return { success: false, error: 'Ungültige Anmeldedaten' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Fehler beim Anmelden' };
    }
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('currentAdmin');
    // Zusätzlich alle anderen möglichen Session-Daten löschen
    sessionStorage.clear();
    // Falls später weitere Session-Daten hinzugefügt werden
  };

  const clearSession = () => {
    setCurrentAdmin(null);
    localStorage.clear();
  };

  const hasPermission = (permission) => {
    if (!currentAdmin) return false;
    
    // Überprüfe, ob der Admin spezifische Berechtigungen hat
    if (currentAdmin.permissions && Array.isArray(currentAdmin.permissions)) {
      return currentAdmin.permissions.includes(permission);
    }
    
    // Fallback für alte Rollen-basierte Berechtigungen
    const permissions = {
      superAdmin: ['upload', 'delete', 'manage_players', 'manage_ranks', 'manage_troop_strengths', 'manage_norms', 'manage_chest_mapping', 'manage_admin_requests', 'create_period', 'view_admin_data'],
      contentAdmin: ['manage_players', 'manage_ranks', 'manage_troop_strengths', 'manage_norms', 'manage_chest_mapping', 'view_admin_data'],
      viewer: ['view_admin_data']
    };

    return permissions[currentAdmin.role]?.includes(permission) || false;
  };

  const value = {
    currentAdmin,
    login,
    logout,
    clearSession,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
