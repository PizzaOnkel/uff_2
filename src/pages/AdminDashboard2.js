import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, setDoc, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { query, where, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';
// Hilfsfunktion: aggregatedData als CSV exportieren und auf Server speichern
async function exportAggregatedDataToCSV(aggregatedData) {
  if (!aggregatedData || aggregatedData.length === 0) return { ok: false, error: 'Keine aggregierten Daten.' };
  // Erwartete Kategorien für die TopTen-Seite
  const categoryKeys = [
    'Arena Total', 'Common Total', 'Rare Total', 'Epic Total', 'Tartaros Total', 'Elven Total',
    'Cursed Total', 'Bank Total', 'Runic Total', 'Heroic Total', 'VotA Total', 'ROTA Total',
    'EAs Total', 'Union Total', 'Jormungandr Total', 'Points'
  ];
  // Mapping-Funktion importieren
  const { mapChestToCategoryAndLevel } = require('../utils/chestMapping');

  const rows = [];
  aggregatedData.forEach(group => {
    (group.players || []).forEach(player => {
      // Initialisiere alle Kategorien mit 0
      const categoryTotals = {};
      categoryKeys.forEach(key => { categoryTotals[key] = 0; });

      // Chests aggregieren
      let chests = player.chests;
      if (Array.isArray(chests)) {
        chests.forEach(chest => {
          const mapped = mapChestToCategoryAndLevel(chest);
          // Mapping von Kategorie zu CSV-Key
          let key = null;
          switch (mapped.category) {
            case 'Arena Chests': key = 'Arena Total'; break;
            case 'Common Chests': key = 'Common Total'; break;
            case 'Rare Chests': key = 'Rare Total'; break;
            case 'Epic Chests': key = 'Epic Total'; break;
            case 'Tartaros Chests': key = 'Tartaros Total'; break;
            case 'Elven Chests': key = 'Elven Total'; break;
            case 'Cursed Chests': key = 'Cursed Total'; break;
            case 'Bank Chests': key = 'Bank Total'; break;
            case 'Runic Chests': key = 'Runic Total'; break;
            case 'Heroic Chests': key = 'Heroic Total'; break;
            case 'Vault of the Ancients': key = 'VotA Total'; break;
            case 'ROTA Total': key = 'ROTA Total'; break;
            case 'Epic Ancient squad': key = 'EAs Total'; break;
            case 'Union Chest': key = 'Union Total'; break;
            case 'Union Total': key = 'Union Total'; break;
            case 'Jormungandr Chests': key = 'Jormungandr Total'; break;
            default: break;
          }
          if (key && categoryTotals[key] !== undefined) {
            categoryTotals[key] += mapped.count || 1;
          }
        });
      }
      // Punkte übernehmen, falls vorhanden
      if (typeof player.points === 'number') {
        categoryTotals['Points'] = player.points;
      } else if (typeof player.Points === 'number') {
        categoryTotals['Points'] = player.Points;
      }
      // Zeile für CSV
      rows.push({
        periodId: group.periodId,
        eventDate: group.eventDate,
        Clanmate: player.Clanmate || player.playerName || player.name || '',
        ...categoryTotals
      });
    });
  });
  const csv = Papa.unparse(rows, { delimiter: ";" });
  // Sende CSV an Server-API zum Speichern
  try {
    // Explizite URL für lokalen Server auf Port 3001
    const res = await fetch('http://localhost:3001/uff_2/api/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv })
    });
    if (!res.ok) {
      let msg = 'Fehler beim Speichern der CSV auf dem Server';
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) msg = errJson.error;
      } catch {}
      throw new Error(msg);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
// Hilfsfunktion für Klartext-Zeitraum
function formatPeriod(period) {
  if (period.start && period.end) {
    const start = new Date(period.start).toLocaleDateString('de-DE');
    const end = new Date(period.end).toLocaleDateString('de-DE');
    return `${start} – ${end}`;
  }
  return period.id;
}
// Button-Styles für Dialoge (wie im AdminPanel)
// Button-Styles für Dialoge (wie im AdminPanel)
const navButtonStyle = {
  background: '#10B981',
  color: 'white',
  padding: '12px 24px',
  borderRadius: 8,
  fontWeight: 'bold',
  fontSize: 18,
  marginBottom: 12,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};
const deleteButtonStyle = {
  ...navButtonStyle,
  background: '#DC2626',
};

const dialogBackdrop = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.2)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const dialogBox = {
  background: '#1F2937', // Tailwind bg-gray-800
  color: 'white',
  borderRadius: 16,
  padding: 32,
  minWidth: 340,
  maxWidth: 420,
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  border: '1px solid #374151', // Tailwind border-gray-700
  fontSize: 18,
};

// Perioden werden jetzt dynamisch aus Firestore geladen

function AdminDashboard2({ setCurrentPage }) {
  // Sortier-Optionen für Mappingvorschläge
  const [sortField, setSortField] = useState('category'); // 'category' oder 'chestName'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' oder 'desc'
  // ...existing code...
  // Ergebnisse veröffentlichen
  const handlePublish = async () => {
    setPublishStatus('läuft...');
    try {
      // Schreibe jede Gruppe als eigenes Dokument in publishedResults
      for (const group of aggregatedData) {
        const docRef = doc(db, 'publishedResults', `${group.periodId}_${group.eventDate}`);
        const payload = {
          periodId: group.periodId,
          eventDate: group.eventDate,
          players: group.players,
          publishedAt: new Date().toISOString(),
        };
        console.log('[DEBUG] Schreibe publishedResults:', docRef.path, payload);
        await setDoc(docRef, payload);
      }
      setPublishStatus('erledigt');
      setToast('Ergebnisse veröffentlicht!');
      setTimeout(() => setToast(''), 2000);
      console.log('[DEBUG] Ergebnisse erfolgreich veröffentlicht!');
    } catch (e) {
      setPublishStatus('Fehler');
      setToast('Fehler beim Veröffentlichen!');
      setTimeout(() => setToast(''), 3000);
      console.error('[DEBUG] Fehler beim Veröffentlichen:', e);
    }
  };

  // CSV-Export-Button-Handler
  const [exportStatus, setExportStatus] = useState('offen');
  // Nach Export bleibt die Seite, zeigt Erfolg und bietet Button für Navigation
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const handleExportCSV = async () => {
    console.log('[DEBUG] handleExportCSV gestartet');
    setExportStatus('läuft...');
    try {
      const result = await exportAggregatedDataToCSV(aggregatedData);
      console.log('[DEBUG] exportAggregatedDataToCSV Ergebnis:', result);
      if (result.ok) {
        setExportStatus('erledigt');
        setShowExportSuccess(true);
        setToast('CSV erfolgreich exportiert!');
        setTimeout(() => setToast(''), 2000);
      } else {
        setExportStatus('Fehler');
        setToast('Fehler beim CSV-Export: ' + (result.error || 'Unbekannt'));
        setTimeout(() => setToast(''), 3000);
        console.error('[DEBUG] Fehler beim CSV-Export:', result.error);
      }
    } catch (err) {
      setExportStatus('Fehler');
      setToast('Fehler beim CSV-Export: ' + (err.message || 'Unbekannt'));
      setTimeout(() => setToast(''), 3000);
      console.error('[DEBUG] Unerwarteter Fehler im Export-Handler:', err);
    }
  };
  // Zusätzliche States für Delete-Dialog und JSON-Dateien
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Für Dropdown: Sessions (uploadId) als Einträge
  const [jsonFileEntries, setJsonFileEntries] = useState([]); // [{uploadId, uploadtime, periodId, count, filename}]
  const [selectedDeleteEntry, setSelectedDeleteEntry] = useState(null);
  // Neue Löschfunktion: komplette Session (uploadId) löschen oder Altbestände ohne uploadId
  const handleDeleteSession = async (uploadId) => {
    try {
      setDeleteLoading(true);
      const batch = writeBatch(db);
      let q, snapshot;
      if (!uploadId || uploadId === 'ohneUploadId') {
        // Lösche alle Einträge ohne uploadId (Altbestände)
        q = query(collection(db, 'results'));
        snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.uploadId) batch.delete(docSnap.ref);
        });
      } else {
        // Alle Events mit dieser uploadId finden und löschen
        q = query(collection(db, 'results'), where('uploadId', '==', uploadId));
        snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
      }
      await batch.commit();
      // Nach dem Löschen: Ergebnisse neu laden, damit das Dropdown aktuell ist
      const newSnapshot = await getDocs(collection(db, 'results'));
      const allResults = newSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sessions neu berechnen
      const sessionMap = {};
      allResults.forEach(r => {
        const uploadId = r.uploadId || 'ohneUploadId';
        if (!sessionMap[uploadId]) {
          sessionMap[uploadId] = {
            uploadId,
            uploadtime: r.uploadtime,
            periodId: r.periodId,
            count: 0
          };
        }
        sessionMap[uploadId].count++;
      });
      setJsonFileEntries(Object.values(sessionMap));
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setSelectedDeleteEntry(null);
    } catch (e) {
      setDeleteLoading(false);
      setDeleteError('Fehler beim Löschen der Session!');
    }
  };
// (alte Löschfunktion entfernt, nur noch Session-Löschung aktiv)
  const [toast, setToast] = useState("");
  const { currentAdmin } = useAuth();
  // Alle States am Anfang deklarieren!
  const [aggStatus, setAggStatus] = useState('offen');
  const [serverStatus, setServerStatus] = useState('offen');
  const [publishStatus, setPublishStatus] = useState('offen');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]); // dynamisch geladen
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [results, setResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  // aggregatedData ist bereits oben deklariert

  // Aggregiert alle Ergebnisse nach Periode und Eventdatum und fasst Spieler zusammen
  const handleAggregation = async () => {
    setAggStatus('läuft...');
    try {
      // Ergebnisse aus Firestore laden
      const snapshot = await getDocs(collection(db, "results"));
      const allResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Gruppieren nach periodId und eventDate
      const groups = {};
      allResults.forEach(result => {
        const key = `${result.periodId}_${result.eventDate}`;
        if (!groups[key]) {
          groups[key] = {
            periodId: result.periodId,
            eventDate: result.eventDate,
            players: []
          };
        }
        groups[key].players.push(result);
      });

      const aggregated = Object.values(groups);
      setAggregatedData(aggregated);
      console.log('[DEBUG] aggregatedData nach Aggregation:', aggregated);
      setAggStatus('erledigt');
      setToast('Aggregation abgeschlossen!');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      setAggStatus('Fehler');
      setToast('Fehler bei der Aggregation!');
      setTimeout(() => setToast(''), 2000);
      console.error('[DEBUG] Fehler bei der Aggregation:', e);
    }
  };

  // Toast oben auf der Seite anzeigen
  useEffect(() => {
    // Toast-Logik, ggf. asynchron
    // ...
  }, [toast]);
  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "results"));
      const allResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResults(allResults);
      // Gruppiere nach uploadId (jede Datei = 1 Eintrag)
      const entryMap = {};
      allResults.forEach(r => {
        const uploadId = r.uploadId || 'ohneUploadId';
        if (!entryMap[uploadId]) {
          entryMap[uploadId] = {
            uploadId,
            filename: r.filename || r.fileId || 'Unbekannt',
            uploadtime: r.uploadtime || '',
            periodId: r.periodId || '',
            count: 0,
            eventDates: new Set(),
          };
        }
        entryMap[uploadId].count++;
        if (r.eventDate) entryMap[uploadId].eventDates.add(r.eventDate);
      });
      // Umwandeln in Array und Eventdates als Array
      const fileEntries = Object.values(entryMap).map(e => ({
        ...e,
        eventDates: Array.from(e.eventDates).sort()
      }));
      setJsonFileEntries(fileEntries);
      setLoading(false);
    }
    fetchResults();

    // Perioden aus Firestore laden und debuggen
    async function fetchPeriods() {
      try {
        const periodSnap = await getDocs(collection(db, "periods"));
        const periodList = periodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('[DEBUG] Geladene Perioden aus Firestore:', periodList);
        setPeriods(periodList);
      } catch (e) {
        console.error('[DEBUG] Fehler beim Laden der Perioden:', e);
        setPeriods([]);
      }
    }

    fetchPeriods();
  }, []);

// Auto-Select für Perioden, wenn nur eine vorhanden ist
useEffect(() => {
  if (periods.length === 1 && !selectedPeriod) {
    setSelectedPeriod(periods[0].id);
    console.debug('[DEBUG] selectedPeriod nach Auto-Select:', periods[0].id);
  }
}, [periods, selectedPeriod]);


  if (!currentAdmin || currentAdmin.role !== 'superAdmin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Kein Zugriff</h2>
        <p className="text-lg">Diese Seite ist nur für SuperAdmins sichtbar.</p>
        <button className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setCurrentPage('adminPanel')}>Zurück</button>
      </div>
    );
  }

  // Server starten: Hier könnte ein echter API-Call erfolgen (Platzhalter)
  const handleServer = async () => {
    setServerStatus('läuft...');
    try {
      // Beispiel: await fetch('/api/server-action', { method: 'POST' });
      // Hier ggf. echten Serverprozess anstoßen
    } catch (e) {
      // Fehlerbehandlung, falls nötig
    }
    try {
      // Schreibe jede Gruppe als eigenes Dokument in publishedResults
      for (const group of aggregatedData) {
        const docRef = doc(db, 'publishedResults', `${group.periodId}_${group.eventDate}`);
        const payload = {
          periodId: group.periodId,
          eventDate: group.eventDate,
          players: group.players,
          publishedAt: new Date().toISOString(),
        };
        console.log('[DEBUG] Schreibe publishedResults:', docRef.path, payload);
        await setDoc(docRef, payload);
      }
      setPublishStatus('erledigt');
      setToast('Ergebnisse veröffentlicht!');
      setTimeout(() => setToast(''), 2000);
      console.log('[DEBUG] Ergebnisse erfolgreich veröffentlicht!');
    } catch (e) {
      setPublishStatus('Fehler');
      setToast('Fehler beim Veröffentlichen!');
      setTimeout(() => setToast(''), 2000);
      console.error('[DEBUG] Fehler beim Veröffentlichen:', e);
    }
  };
  const handleStartUpload = () => {
    setShowUploadDialog(true);
    setUploadStep(1);
    setSelectedPeriod('');
    setSelectedFile(null);
    setUploadError('');
    setUploadProgress(0);
  };
  const handleUploadNext = async () => {
    console.log('[DEBUG] Upload-Button geklickt', { selectedPeriod, selectedFile });
    if (!selectedPeriod) {
      setUploadError('Bitte Periode auswählen!');
      console.warn('[DEBUG] Kein selectedPeriod gesetzt!');
      return;
    }
    if (!selectedFile) {
      setUploadError('Bitte Datei auswählen!');
      console.warn('[DEBUG] Keine Datei ausgewählt!');
      return;
    }
    setUploadStep(3);
    setUploadError('');
    setUploadProgress(0);
    setUploadStatus('Lade hoch...');
    try {
      // Datei einlesen und parsen
      const fileText = await selectedFile.text();
      let jsonData = [];
      try {
        jsonData = JSON.parse(fileText);
        console.log('[DEBUG] JSON erfolgreich geparst:', jsonData);
      } catch (e) {
        setUploadError('Fehler beim Parsen der JSON-Datei!');
        setUploadStep(1);
        setUploadStatus('');
        console.error('[DEBUG] Fehler beim Parsen der JSON-Datei:', e);
        return;
      }
      // Wenn das JSON ein Objekt mit mehreren Datums-Keys ist, flache es auf Einträge mit eventDate ab
      let flatEntries = [];
      if (!Array.isArray(jsonData) && typeof jsonData === 'object') {
        for (const [dateKey, arr] of Object.entries(jsonData)) {
          if (Array.isArray(arr)) {
            for (const entry of arr) {
              flatEntries.push({ ...entry, eventDate: dateKey });
            }
          }
        }
      } else if (Array.isArray(jsonData)) {
        flatEntries = jsonData;
      } else {
        flatEntries = [jsonData];
      }
      console.log('[DEBUG] FlatEntries für Upload:', flatEntries);

      // === NEU: Schreibe Uploadzeitpunkt und uploadId in Collection 'uploadtime' ===
      const uploadtime = new Date().toISOString();
      const uploadId = uuidv4();
      try {
        const uploadtimeDocRef = await addDoc(collection(db, "uploadtime"), {
          periodId: selectedPeriod,
          uploadtime,
          uploadId
        });
        console.log('[DEBUG] uploadtime-Dokument erfolgreich geschrieben:', uploadtimeDocRef.id);
      } catch (err) {
        console.error('[ERROR] Fehler beim Schreiben in die Collection uploadtime:', err);
        setUploadError('Fehler beim Schreiben in die Collection uploadtime: ' + err.message);
        setUploadStep(1);
        setUploadStatus('');
        return;
      }

      // Schreibe jeden Eintrag als Dokument in die Collection 'results', mit uploadId
      let uploaded = 0;
      for (const entry of flatEntries) {
        // periodId aus Auswahl ergänzen
        if (!entry.eventDate) {
          console.warn('[DEBUG] Überspringe Eintrag ohne eventDate:', entry);
          continue;
        }
        const docData = { ...entry, periodId: selectedPeriod, uploadtime, uploadId };
        try {
          await addDoc(collection(db, 'results'), docData);
        } catch (err) {
          console.error('[DEBUG] Fehler beim Schreiben in Firestore:', err, docData);
          setUploadError('Fehler beim Schreiben in Firestore!');
        }
        uploaded++;
        setUploadProgress(Math.round((uploaded / flatEntries.length) * 100));
      }
      setUploadProgress(100);
      setUploadStatus('');
      setTimeout(() => {
        setShowUploadDialog(false);
        setToast('Upload erfolgreich!');
        setTimeout(() => {
          setToast('');
          setUploadStatus('');
          setUploadStep(1);
          setSelectedFile(null);
        }, 1500);
      }, 500);
    } catch (e) {
      setUploadError('Fehler beim Hochladen!');
      setUploadStep(1);
      setUploadStatus('');
      console.error('[DEBUG] Fehler beim Hochladen:', e);
    }
  };
  // handleFileChange und handleStartDelete werden für Firestore-Workflow nicht mehr benötigt
  // Löschen: Löscht alle Dokumente einer ausgewählten Gruppe aus 'results'
  const handleDeleteNext = async () => {
    if (!selectedGroup) {
      setDeleteError('Bitte wähle eine Ergebnis-Gruppe aus!');
      return;
    }
    setDeleteError('');
    setDeleteStep(2);
    try {
      for (const docId of selectedGroup.documentIds) {
        await deleteDoc(doc(db, 'results', docId));
      }
      setDeleteSuccess(true);
      setToast('Ergebnis-Gruppe gelöscht!');
      setTimeout(() => {
        setShowDeleteDialog(false);
        setDeleteSuccess(false);
        setDeleteStep(1);
        setSelectedGroup(null);
        setToast('');
      }, 1200);
    } catch (e) {
      setDeleteError('Fehler beim Löschen!');
    }
  };

  // (entfernt, alles am Anfang definiert)
  const renderUploadDialog = () => (
    <div style={dialogBackdrop}>
      <div style={dialogBox}>
        <div>
          <h2 className="text-xl font-bold mb-4">JSON-Datei hochladen</h2>
          {/* Ladebalken und Statusanzeige */}
          {uploadStep >= 3 && (
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div className="bg-indigo-500 h-4 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="text-sm text-gray-300">{uploadStatus || `${uploadProgress}%`}</div>
            </div>
          )}
          {loading && (
            <div className="mb-4 text-gray-400">Lade Perioden...</div>
          )}
          {!loading && periods.length === 0 && (
            <div className="mb-4 text-red-400 font-bold">Keine Event-Periode gefunden! Bitte lege zuerst eine Periode an.</div>
          )}
          {periods.length > 1 ? (
            <>
              <label className="block mb-2">Event/Periode auswählen:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                {periods
                  .slice()
                  .sort((a, b) => {
                    // [kein EventDate] immer ganz unten (falls vorhanden)
                    if (!a.end) return 1;
                    if (!b.end) return -1;
                    const dateA = new Date(a.end);
                    const dateB = new Date(b.end);
                    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
                    return String(b.end).localeCompare(String(a.end));
                  })
                  .map((period) => (
                    <option key={period.id} value={period.id} className="bg-gray-900 text-gray-100">
                      {period.name ? `${period.name} (${formatPeriod(period)})` : formatPeriod(period)}
                    </option>
                  ))}
              </select>
            </>
          ) : periods.length === 1 ? (
            <div className="mb-4">
              <label className="block mb-2">Event/Periode:</label>
              <div className="p-2 rounded bg-gray-900 text-gray-100 border border-gray-700">
                {periods[0].name ? `${periods[0].name} (${formatPeriod(periods[0])})` : formatPeriod(periods[0])}
              </div>
            </div>
          ) : (
            <div className="mb-4 text-red-400">Keine Eventperiode gefunden!</div>
          )}
          <input
            type="file"
            accept=".json"
            className="mb-4 w-full text-gray-100 file:bg-indigo-600 file:text-white file:rounded file:px-3 file:py-1 file:border-0 file:mr-2 file:cursor-pointer"
            onChange={e => {
              setSelectedFile(e.target.files[0] || null);
              setTimeout(() => {
                console.log('[DEBUG] File selected:', e.target.files[0]);
                console.log('[DEBUG] Aktueller State:', {
                  selectedPeriod,
                  selectedFile: e.target.files[0],
                  uploadStep,
                  loading
                });
              }, 100);
            }}
            disabled={uploadStep === 3}
          />
          {/* Debug-Ausgabe entfernt */}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleUploadNext}
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white px-4 py-2 rounded shadow font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadStep === 3 || !selectedPeriod || !selectedFile || loading}
            >
              {uploadStep === 3 ? 'Hochladen...' : 'Hochladen'}
            </button>
            <button
              onClick={() => setShowUploadDialog(false)}
              className="bg-gray-800 hover:bg-gray-900 text-gray-100 px-4 py-2 rounded shadow font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadStep === 3}
            >
              Abbrechen
            </button>
          </div>
          {uploadError && <div className="mt-4 text-sm text-red-400">{uploadError}</div>}
        </div>
      </div>
    </div>
  );

  // Dialog wie in alter AdminPanelPage: Gruppierte Ergebnisse auswählbar
  const renderDeleteDialog = () => (
    <div style={dialogBackdrop}>
      <div style={dialogBox}>
        <h2 className="text-xl font-bold mb-4">JSON-Datei löschen</h2>
        {loading ? (
          <p className="text-gray-400">Lade Daten...</p>
        ) : jsonFileEntries.length === 0 ? (
          <>
            <p className="text-gray-400">Keine JSON-Dateien vorhanden.</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => { setShowDeleteDialog(false); setSelectedDeleteEntry(null); setDeleteStep(1); setDeleteError(''); }}
                className="bg-gray-800 hover:bg-gray-900 text-gray-100 px-4 py-2 rounded shadow font-bold focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Schließen
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="block mb-2">Datei auswählen:</label>
            <select
              className="w-full p-2 mb-4 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={selectedDeleteEntry ? selectedDeleteEntry.uploadId : ''}
              onChange={e => {
                const val = e.target.value;
                const found = jsonFileEntries.find(entry => entry.uploadId === val);
                setSelectedDeleteEntry(found || null);
              }}
            >
              <option value="">Bitte wählen...</option>
              {jsonFileEntries
                .slice()
                .sort((a, b) => {
                  // Neueste oben
                  return (b.uploadtime || '').localeCompare(a.uploadtime || '');
                })
                .map(entry => {
                  let label = `${entry.filename} | Spieler: ${entry.count}`;
                  if (entry.uploadtime) label += ` | Hochgeladen: ${new Date(entry.uploadtime).toLocaleString('de-DE')}`;
                  if (entry.eventDates && entry.eventDates.length > 0) label += ` | EventDates: ${entry.eventDates.join(', ')}`;
                  return (
                    <option key={entry.uploadId} value={entry.uploadId}>{label}</option>
                  );
                })}
            </select>
            {selectedDeleteEntry && (
              <div className="mb-4 p-3 bg-gray-800 rounded">
                <div className="mb-1"><b>Dateiname:</b> <span className="text-green-300">{selectedDeleteEntry.filename}</span></div>
                <div className="mb-1"><b>Uploadzeit:</b> <span className="text-yellow-300">{selectedDeleteEntry.uploadtime ? new Date(selectedDeleteEntry.uploadtime).toLocaleString('de-DE') : '-'}</span></div>
                <div className="mb-1"><b>EventDates:</b> <span className="text-blue-300">{selectedDeleteEntry.eventDates && selectedDeleteEntry.eventDates.length > 0 ? selectedDeleteEntry.eventDates.join(', ') : '-'}</span></div>
                <div className="mb-1"><b>Spieleranzahl:</b> {selectedDeleteEntry.count}</div>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => selectedDeleteEntry && handleDeleteSession(selectedDeleteEntry.uploadId)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDeleteEntry || deleteSuccess}
              >
                {deleteSuccess ? 'Gelöscht!' : 'Löschen'}
              </button>
              <button
                onClick={() => { setShowDeleteDialog(false); setSelectedDeleteEntry(null); setDeleteStep(1); setDeleteError(''); }}
                className="bg-gray-800 hover:bg-gray-900 text-gray-100 px-4 py-2 rounded shadow font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteSuccess}
              >
                Abbrechen
              </button>
            </div>
            {deleteError && <div className="mt-4 text-sm text-red-400">{deleteError}</div>}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-6 pb-8 w-full">
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-bold animate-fade-in">
          {toast}
        </div>
      )}
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-center text-blue-400 mt-12">
            Admin Dashboard (Dateiverwaltung)
          </h2>
          <button
            onClick={() => setCurrentPage('adminPanel')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Zurück zur Admin-Seite
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full mb-12">
        {/* Automatisierungs-Buttons */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow-lg">
            <button
              onClick={handleAggregation}
              className="w-full py-3 px-4 rounded-lg shadow-md transition duration-200 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Aggregation starten (Veröffentlichung Schritt 1)
            </button>
            <span className={`text-sm font-semibold mt-1 ${aggStatus === 'erledigt' ? 'text-green-400' : aggStatus === 'läuft...' ? 'text-yellow-400' : 'text-gray-400'}`}>Status: {aggStatus}</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow-lg">
            <button
              onClick={handleServer}
              className="w-full py-3 px-4 rounded-lg shadow-md transition duration-200 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Server starten (Veröffentlichung Schritt 2)
            </button>
            <span className={`text-sm font-semibold mt-1 ${serverStatus === 'erledigt' ? 'text-green-400' : serverStatus === 'läuft...' ? 'text-yellow-400' : 'text-gray-400'}`}>Status: {serverStatus}</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow-lg">
            <button
              onClick={() => { console.log('[DEBUG] Publish-Button geklickt'); handlePublish(); }}
              className="w-full py-3 px-4 rounded-lg shadow-md transition duration-200 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Ergebnisse veröffentlichen (Veröffentlichung Schritt 3)
            </button>
            <span className={`text-sm font-semibold mt-1 ${publishStatus === 'erledigt' ? 'text-green-400' : publishStatus === 'läuft...' ? 'text-yellow-400' : 'text-gray-400'}`}>Status: {publishStatus}</span>
          </div>
          <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow-lg">
            {!showExportSuccess ? (
              <>
                <button
                  onClick={handleExportCSV}
                  className="w-full py-3 px-4 rounded-lg shadow-md transition duration-200 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white font-bold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Aggregierte Daten als CSV exportieren
                </button>
                <span className={`text-sm font-semibold mt-1 ${exportStatus === 'erledigt' ? 'text-green-400' : exportStatus === 'läuft...' ? 'text-yellow-400' : 'text-gray-400'}`}>Status: {exportStatus}</span>
              </>
            ) : (
              <>
                <div className="text-green-400 font-bold text-lg mb-2">CSV erfolgreich exportiert!</div>
                <button
                  onClick={() => { setShowExportSuccess(false); setCurrentPage('adminPanel'); }}
                  className="w-full py-3 px-4 rounded-lg shadow-md transition duration-200 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-bold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Zurück zur Admin-Seite
                </button>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleStartUpload}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-green-900/30 hover:bg-green-800/40 border-green-800 min-w-[260px]"
        >
          <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">JSON-Datei hochladen</span>
          <span className="text-sm text-gray-400 text-center mb-2">Wähle eine Datei aus und lade sie hoch</span>
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-red-900/30 hover:bg-red-800/40 border-red-800 min-w-[260px]"
        >
          <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 6h18" />
            <path d="M19 6l-2 14H7L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">JSON-Datei löschen</span>
          <span className="text-sm text-gray-400 text-center">Löscht die aktuelle Datei</span>
        </button>
      </div>
      {showUploadDialog && renderUploadDialog()}
      {showDeleteDialog && renderDeleteDialog()}
    </div>
  );
}
export default AdminDashboard2;
