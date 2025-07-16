import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";

export default function CurrentTotalEventPageMobileSafe({ t, setCurrentPage }) {
  const [renderStatus, setRenderStatus] = useState("Starting...");
  
  // Sehr einfache Komponente ohne komplexe Logik
  useEffect(() => {
    try {
      setRenderStatus("Component loaded successfully");
    } catch (error) {
      setRenderStatus("Error: " + error.message);
    }
  }, []);

  // Minimal-Version ohne Firebase, ohne komplexe Tabellen
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Super-einfaches Debug Panel */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '15px',
        fontSize: '14px',
        zIndex: '9999',
        border: '3px solid #ffffff',
        textAlign: 'center'
      }}>
        <div><strong>MOBILE SAFE MODE</strong></div>
        <div>Status: {renderStatus}</div>
        <div>Screen: {window.innerWidth}px x {window.innerHeight}px</div>
        <div>Browser: {navigator.userAgent.substring(0, 50)}...</div>
      </div>
      
      <div style={{ marginTop: '100px' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '24px',
          color: '#4a9eff'
        }}>
          Event-Seite (Mobile Safe Mode)
        </h1>
        
        <div style={{
          backgroundColor: '#333333',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#4a9eff' }}>Test-Daten</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>Max Mustermann:</strong> 3456 Punkte
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Erika Musterfrau:</strong> 2800 Punkte
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Hans Beispiel:</strong> 4200 Punkte
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#333333',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#4a9eff' }}>Gesamtergebnis</h2>
          <div><strong>Gesamtpunkte:</strong> 10456</div>
          <div><strong>Teilnehmer:</strong> 3</div>
          <div><strong>Durchschnitt:</strong> 3485 Punkte</div>
        </div>
        
        <button 
          onClick={() => {
            try {
              setCurrentPage(ROUTES.NAVIGATION);
            } catch (error) {
              alert("Error: " + error.message);
            }
          }}
          style={{
            backgroundColor: '#4a9eff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'block',
            margin: '20px auto',
            minHeight: '50px',
            minWidth: '200px'
          }}
        >
          ← Zurück zur Navigation
        </button>
        
        <div style={{
          backgroundColor: '#333333',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '12px',
          color: '#cccccc'
        }}>
          <strong>Info:</strong> Dies ist eine vereinfachte Version der Event-Seite, 
          die auch auf problematischen mobilen Geräten funktionieren sollte.
        </div>
      </div>
    </div>
  );
}
