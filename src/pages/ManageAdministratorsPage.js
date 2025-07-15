import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function ManageAdministratorsPage({ t, setCurrentPage }) {
  const { currentAdmin } = useAuth();
  const [administrators, setAdministrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Verfügbare Berechtigungen
  const availablePermissions = [
    { id: 'manage_players', label: 'Spieler verwalten', description: 'Spieler erstellen, bearbeiten und löschen' },
    { id: 'upload', label: 'Daten hochladen', description: 'JSON-Daten hochladen und importieren' },
    { id: 'delete', label: 'Daten löschen', description: 'Spieler und Daten permanent löschen' },
    { id: 'manage_ranks', label: 'Ränge verwalten', description: 'Clan-Ränge und Normen bearbeiten' },
    { id: 'manage_troop_strengths', label: 'Truppenstärken verwalten', description: 'Truppenstärken-Tabellen bearbeiten' },
    { id: 'manage_norms', label: 'Normen verwalten', description: 'Clan-Normen und -Regeln bearbeiten' },
    { id: 'manage_chest_mapping', label: 'Truhen-Zuordnungen verwalten', description: 'Truhen-Punkte-Zuordnungen bearbeiten' },
    { id: 'create_period', label: 'Neue Perioden erstellen', description: 'Neue Bewertungsperioden anlegen' },
    { id: 'manage_admin_requests', label: 'Admin-Anfragen verwalten', description: 'Neue Admin-Anfragen genehmigen oder ablehnen' },
    { id: 'view_admin_data', label: 'Admin-Daten einsehen', description: 'Zugriff auf alle Admin-Bereiche' }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snapshot) => {
      const adminList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sortiere nach Erstellungsdatum
      adminList.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));
      setAdministrators(adminList);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEditPermissions = (admin) => {
    setEditingAdmin(admin);
    setEditPermissions(admin.permissions || []);
    setShowPermissionDialog(true);
  };

  const handlePermissionToggle = (permissionId) => {
    setEditPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!editingAdmin) return;

    try {
      await updateDoc(doc(db, "admins", editingAdmin.id), {
        permissions: editPermissions,
        role: editPermissions.length > 0 ? 'custom' : 'viewer',
        updatedAt: new Date().toISOString(),
        updatedBy: currentAdmin.name
      });

      setShowPermissionDialog(false);
      setEditingAdmin(null);
      setEditPermissions([]);
      alert("Berechtigungen wurden erfolgreich aktualisiert!");
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("Fehler beim Aktualisieren der Berechtigungen!");
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (adminId === currentAdmin.id) {
      alert("Du kannst dich nicht selbst löschen!");
      return;
    }

    if (window.confirm(`Möchtest du den Administrator "${adminName}" wirklich löschen?`)) {
      try {
        await deleteDoc(doc(db, "admins", adminId));
        alert("Administrator wurde erfolgreich gelöscht!");
      } catch (err) {
        console.error("Error deleting admin:", err);
        alert("Fehler beim Löschen des Administrators!");
      }
    }
  };

  const getRoleDisplay = (admin) => {
    if (admin.role === 'custom' && admin.permissions) {
      return `Benutzerdefiniert (${admin.permissions.length} Berechtigungen)`;
    }
    const roleNames = {
      'superAdmin': 'Super Admin',
      'contentAdmin': 'Content Admin',
      'viewer': 'Viewer',
      'custom': 'Benutzerdefiniert'
    };
    return roleNames[admin.role] || admin.role;
  };

  const getPermissionNames = (permissions) => {
    if (!permissions || permissions.length === 0) return 'Keine Berechtigungen';
    return permissions.map(p => {
      const permission = availablePermissions.find(ap => ap.id === p);
      return permission ? permission.label : p;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Lade Administratoren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">
        Administratoren verwalten
      </h2>
      
      <div className="w-full max-w-6xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">
          Aktuelle Administratoren ({administrators.length})
        </h3>
        
        {administrators.length === 0 ? (
          <p className="text-gray-400">Keine Administratoren gefunden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">E-Mail</th>
                  <th className="px-4 py-2 text-left">Clan-Rolle</th>
                  <th className="px-4 py-2 text-left">Admin-Rolle</th>
                  <th className="px-4 py-2 text-left">Berechtigungen</th>
                  <th className="px-4 py-2 text-left">Erstellt</th>
                  <th className="px-4 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {administrators.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        {admin.id === currentAdmin.id && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2">
                            Du
                          </span>
                        )}
                        {admin.name}
                      </div>
                    </td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2">{admin.clanRole || 'Unbekannt'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        admin.role === 'superAdmin' ? 'bg-red-600' :
                        admin.role === 'contentAdmin' ? 'bg-green-600' :
                        admin.role === 'custom' ? 'bg-purple-600' :
                        'bg-gray-600'
                      }`}>
                        {getRoleDisplay(admin)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-300 truncate" title={getPermissionNames(admin.permissions)}>
                          {getPermissionNames(admin.permissions)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {admin.createdDate ? new Date(admin.createdDate).toLocaleDateString('de-DE') : 'Unbekannt'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPermissions(admin)}
                          className="px-3 py-1 bg-blue-600 rounded text-white text-sm hover:bg-blue-700 transition"
                        >
                          Berechtigungen
                        </button>
                        {admin.id !== currentAdmin.id && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="px-3 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700 transition"
                          >
                            Löschen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Berechtigungen bearbeiten Dialog */}
      {showPermissionDialog && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Berechtigungen bearbeiten
            </h3>
            <p className="text-gray-300 mb-4">
              Berechtigungen für <strong>{editingAdmin.name}</strong> ({editingAdmin.email}):
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {availablePermissions.map(permission => (
                <label key={permission.id} className="flex items-start p-3 bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={editPermissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="mr-3 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium">{permission.label}</span>
                    <p className="text-gray-400 text-sm">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSavePermissions}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setShowPermissionDialog(false);
                  setEditingAdmin(null);
                  setEditPermissions([]);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-purple-300 underline"
      >
        Zurück zum Admin-Panel
      </button>
      
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
