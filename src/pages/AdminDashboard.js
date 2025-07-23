import React, { useState } from "react";
// import entfernt, da kein Router mehr verwendet wird

function AdminDashboard({ setCurrentPage }) {
  const [status, setStatus] = useState("");


  // Schritt 2: JSON-Datei löschen
  const handleDelete = async () => {
    setStatus("Lösche JSON-Datei...");
    try {
      await fetch("http://localhost:3001/delete-json", { method: "POST" });
      setStatus("JSON-Datei gelöscht!");
    } catch (err) {
      setStatus("Fehler beim Löschen der JSON-Datei!");
    }
  };

  // Schritt 3: Aggregation starten
  const handleAggregation = async () => {
    setStatus("Starte Aggregation...");
    try {
      await fetch("http://localhost:3001/trigger-aggregation", { method: "POST" });
      setStatus("Aggregation abgeschlossen!");
    } catch (err) {
      setStatus("Fehler bei der Aggregation!");
    }
  };

  // Schritt 4: Server starten (nur Hinweis)
  const handleServerStart = () => {
    setStatus("Bitte im Terminal 'node server.js' ausführen!");
  };

  // Schritt 5: Ergebnisse veröffentlichen (nur Hinweis)
  const handlePublish = () => {
    setStatus("Ergebnisse sind jetzt für die Spieler sichtbar!");
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "auto" }}>
      <h2>Admin Dashboard</h2>
      <button
        onClick={() => setCurrentPage('admin-dashboard2')}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 32px",
          borderRadius: "16px",
          background: "#1e293b",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          margin: "32px auto",
          cursor: "pointer"
        }}
      >
        <svg style={{ marginRight: 12 }} width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Dateiverwaltung & Uploads
      </button>
      <button onClick={handleAggregation} style={{ margin: "16px 0" }}>Aggregation starten (Schritt 1)</button>
      <button onClick={handleServerStart} style={{ margin: "16px 0" }}>Server starten (Schritt 2)</button>
      <button onClick={handlePublish} style={{ margin: "16px 0" }}>Ergebnisse veröffentlichen (Schritt 3)</button>
      <div style={{ marginTop: 32, color: "#007700", fontWeight: "bold" }}>{status}</div>
      <div style={{ marginTop: 32, fontSize: 14, color: "#555" }}>
        <b>Hinweis:</b> Der Server muss lokal laufen! <br />
        Alle Aktionen funktionieren nur auf deinem Rechner.
      </div>
    </div>
  );
}

export default AdminDashboard;
