import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

export default function ManageAdminRequestsPage({ t, setCurrentPage }) {
  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [selectedRole, setSelectedRole] = useState('contentAdmin');
  const [customPermissions, setCustomPermissions] = useState([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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
    const unsub = onSnapshot(collection(db, "adminRequests"), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sortiere nach Datum (neueste zuerst)
      requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      setAdminRequests(requests);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (requestId) => {
    const request = adminRequests.find(r => r.id === requestId);
    if (!request) return;

    setCurrentRequest(request);
    setSelectedRole('custom'); // Standardmäßig auf custom setzen
    setCustomPermissions([]); // Leere Berechtigungen zu Beginn
    setShowRoleDialog(true);
  };

  // Hilfsfunktionen für Berechtigungsverwaltung
  const handlePermissionToggle = (permissionId) => {
    setCustomPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    if (newRole !== 'custom') {
      setCustomPermissions([]);
    }
  };

  const confirmApproval = async () => {
    if (!currentRequest) return;

    setProcessingId(currentRequest.id);
    setShowRoleDialog(false);

    try {
      // Bestimme die Berechtigungen basierend auf der Auswahl
      let finalPermissions = [];
      
      if (selectedRole === 'custom') {
        finalPermissions = customPermissions;
      } else {
        // Vordefinierte Rollen
        const rolePermissions = {
          superAdmin: ['upload', 'delete', 'manage_players', 'manage_ranks', 'manage_troop_strengths', 'manage_norms', 'manage_chest_mapping', 'manage_admin_requests', 'create_period', 'view_admin_data'],
          contentAdmin: ['manage_players', 'manage_ranks', 'manage_troop_strengths', 'manage_norms', 'manage_chest_mapping', 'view_admin_data'],
          viewer: ['view_admin_data']
        };
        finalPermissions = rolePermissions[selectedRole] || [];
      }

      // Erstelle den neuen Administrator
      await addDoc(collection(db, "admins"), {
        name: currentRequest.name,
        email: currentRequest.email,
        clanRole: currentRequest.clanRole,
        role: selectedRole === 'custom' ? 'custom' : selectedRole,
        permissions: finalPermissions,
        password: currentRequest.password,
        createdBy: "Haupt-Administrator",
        createdDate: new Date().toISOString(),
        status: "active"
      });

      // Aktualisiere den Status der Anfrage
      await updateDoc(doc(db, "adminRequests", currentRequest.id), {
        status: "approved",
        approvedBy: "Haupt-Administrator",
        approvedDate: new Date().toISOString(),
        assignedRole: selectedRole,
        assignedPermissions: finalPermissions
      });
      
      const roleNames = {
        'superAdmin': 'Super Admin',
        'contentAdmin': 'Content Admin',
        'viewer': 'Viewer',
        'custom': 'Benutzerdefinierte Berechtigungen'
      };
      
      alert(`Administrator-Anfrage wurde genehmigt! Rolle: ${roleNames[selectedRole]}`);
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Fehler beim Genehmigen der Anfrage!");
    } finally {
      setProcessingId(null);
      setCurrentRequest(null);
      setCustomPermissions([]);
    }
  };

  const handleReject = async (requestId) => {
    const request = adminRequests.find(r => r.id === requestId);
    if (!request) return;

    setCurrentRequest(request);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const confirmRejection = async () => {
    if (!currentRequest) return;

    setProcessingId(currentRequest.id);
    setShowRejectDialog(false);

    try {
      await updateDoc(doc(db, "adminRequests", currentRequest.id), {
        status: "rejected",
        rejectedBy: "Haupt-Administrator",
        rejectedDate: new Date().toISOString(),
        rejectionReason: rejectionReason || "Kein Grund angegeben"
      });
      
      alert("Administrator-Anfrage wurde abgelehnt.");
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Fehler beim Ablehnen der Anfrage!");
    } finally {
      setProcessingId(null);
      setCurrentRequest(null);
      setRejectionReason('');
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Möchtest du diese Administrator-Anfrage wirklich löschen?")) {
      return;
    }

    setProcessingId(requestId);
    try {
      await deleteDoc(doc(db, "adminRequests", requestId));
      alert("Administrator-Anfrage wurde gelöscht.");
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Fehler beim Löschen der Anfrage!");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-900/30";
      case "approved":
        return "text-green-400 bg-green-900/30";
      case "rejected":
        return "text-red-400 bg-red-900/30";
      default:
        return "text-gray-400 bg-gray-900/30";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Ausstehend";
      case "approved":
        return "Genehmigt";
      case "rejected":
        return "Abgelehnt";
      default:
        return "Unbekannt";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">
        Administrator-Anfragen verwalten
      </h2>
      
      <div className="w-full max-w-6xl">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Lade Administrator-Anfragen...</p>
          </div>
        ) : adminRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Keine Administrator-Anfragen vorhanden.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {adminRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {request.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Angefragt am: {new Date(request.requestDate).toLocaleString('de-DE')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>E-Mail:</strong> {request.email}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Clan-Rolle:</strong> {request.clanRole}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Gewünschte Rolle:</strong> {request.requestedRole === 'contentAdmin' ? 'Content Admin' : 'Viewer'}
                    </p>
                  </div>
                  <div>
                    {request.status === "approved" && (
                      <>
                        <p className="text-green-300 text-sm mb-1">
                          <strong>Genehmigt von:</strong> {request.approvedBy}
                        </p>
                        <p className="text-green-300 text-sm mb-1">
                          <strong>Zugewiesene Rolle:</strong> {request.assignedRole === 'superAdmin' ? 'Super Admin' : request.assignedRole === 'contentAdmin' ? 'Content Admin' : 'Viewer'}
                        </p>
                      </>
                    )}
                    {request.status === "rejected" && (
                      <p className="text-red-300 text-sm mb-1">
                        <strong>Abgelehnt von:</strong> {request.rejectedBy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300 text-sm mb-1">
                    <strong>Grund für Admin-Zugang:</strong>
                  </p>
                  <p className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded">
                    {request.reason}
                  </p>
                </div>

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mb-4">
                    <p className="text-red-300 text-sm mb-1">
                      <strong>Ablehnungsgrund:</strong>
                    </p>
                    <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                      {request.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className={`px-4 py-2 rounded font-semibold transition ${
                          processingId === request.id
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {processingId === request.id ? "Verarbeite..." : "Genehmigen"}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className={`px-4 py-2 rounded font-semibold transition ${
                          processingId === request.id
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {processingId === request.id ? "Verarbeite..." : "Ablehnen"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    disabled={processingId === request.id}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      processingId === request.id
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {processingId === request.id ? "Verarbeite..." : "Löschen"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-blue-300 underline"
      >
        Zurück zum Admin-Panel
      </button>
      
      {/* Rolle-Auswahl Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Administratorrolle zuweisen
            </h3>
            <p className="text-gray-300 mb-4">
              Wähle die Rolle und Berechtigungen für <strong>{currentRequest?.name}</strong>:
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={selectedRole === 'viewer'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="text-white font-medium">Viewer</span>
                  <p className="text-gray-400 text-sm">Kann nur Daten einsehen</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="contentAdmin"
                  checked={selectedRole === 'contentAdmin'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="text-white font-medium">Content Admin</span>
                  <p className="text-gray-400 text-sm">Kann Daten bearbeiten und verwalten</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="superAdmin"
                  checked={selectedRole === 'superAdmin'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="text-white font-medium">Super Admin</span>
                  <p className="text-gray-400 text-sm">Vollzugriff auf alle Funktionen</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="custom"
                  checked={selectedRole === 'custom'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <span className="text-white font-medium">Benutzerdefinierte Berechtigungen</span>
                  <p className="text-gray-400 text-sm">Wähle spezifische Berechtigungen aus</p>
                </div>
              </label>
            </div>
            
            {/* Benutzerdefinierte Berechtigungen */}
            {selectedRole === 'custom' && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Berechtigungen auswählen:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="flex items-start p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={customPermissions.includes(permission.id)}
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
                {customPermissions.length === 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    ⚠️ Bitte wähle mindestens eine Berechtigung aus!
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={confirmApproval}
                disabled={selectedRole === 'custom' && customPermissions.length === 0}
                className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                  selectedRole === 'custom' && customPermissions.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Genehmigen
              </button>
              <button
                onClick={() => {
                  setShowRoleDialog(false);
                  setCurrentRequest(null);
                  setCustomPermissions([]);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ablehnung Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Administrator-Anfrage ablehnen
            </h3>
            <p className="text-gray-300 mb-4">
              Anfrage von <strong>{currentRequest?.name}</strong> ablehnen?
            </p>
            
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">
                Grund für die Ablehnung (optional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white resize-none"
                rows="3"
                placeholder="Grund für die Ablehnung..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmRejection}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Ablehnen
              </button>
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setCurrentRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
