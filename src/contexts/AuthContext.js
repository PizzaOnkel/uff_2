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
      setCurrentAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
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
  };

  const hasPermission = (permission) => {
    if (!currentAdmin) return false;
    
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
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
