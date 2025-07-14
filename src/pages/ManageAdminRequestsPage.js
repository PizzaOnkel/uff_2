import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ManageAdminRequestsPage({ t, setCurrentPage }) {
  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Rolle-Auswahl Dialog
    const roleOptions = {
      'superAdmin': 'Super Admin - Alle Rechte',
      'contentAdmin': 'Content Admin - Spieler, Truhen, Ränge verwalten',
      'viewer': 'Viewer - Nur Einsicht in Daten'
    };

    const selectedRole = window.prompt(
      `Wähle eine Rolle für ${request.name}:\n\n` +
      Object.entries(roleOptions).map(([key, desc], index) => `${index + 1}. ${desc}`).join('\n') +
      '\n\nGib die Nummer ein (1-3):',
      '2'
    );

    if (!selectedRole) return; // Benutzer hat abgebrochen

    const roleMap = ['superAdmin', 'contentAdmin', 'viewer'];
    const roleIndex = parseInt(selectedRole) - 1;
    const finalRole = roleMap[roleIndex] || 'contentAdmin';

    if (!window.confirm(`Administrator-Anfrage von ${request.name} mit Rolle "${roleOptions[finalRole]}" genehmigen?`)) {
      return;
    }

    setProcessingId(requestId);
    try {
      // Erstelle den neuen Administrator
      await addDoc(collection(db, "admins"), {
        name: request.name,
        email: request.email,
        clanRole: request.clanRole,
        role: finalRole,
        password: request.password,
        createdBy: "Haupt-Administrator",
        createdDate: new Date().toISOString(),
        status: "active"
      });

      // Aktualisiere den Status der Anfrage
      await updateDoc(doc(db, "adminRequests", requestId), {
        status: "approved",
        approvedBy: "Haupt-Administrator",
        approvedDate: new Date().toISOString(),
        assignedRole: finalRole
      });
      
      alert(`Administrator-Anfrage wurde genehmigt! Rolle: ${roleOptions[finalRole]}`);
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Fehler beim Genehmigen der Anfrage!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt("Grund für die Ablehnung (optional):");
    if (reason === null) return; // Benutzer hat abgebrochen

    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, "adminRequests", requestId), {
        status: "rejected",
        rejectedBy: "Haupt-Administrator",
        rejectedDate: new Date().toISOString(),
        rejectionReason: reason
      });
      
      // Hier würdest du normalerweise eine E-Mail an den Benutzer senden
      alert("Administrator-Anfrage wurde abgelehnt.");
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Fehler beim Ablehnen der Anfrage!");
    } finally {
      setProcessingId(null);
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
      
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
