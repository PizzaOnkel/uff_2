const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');



const app = express();

// Download-Route für Musikdateien mit Content-Disposition: attachment
app.get('/download/:album/:file', (req, res) => {
  const album = req.params.album;
  const file = req.params.file;
  const filePath = path.join(__dirname, 'public', 'musik', album, file);
  console.log('[DOWNLOAD-DEBUG] Anfrage:', req.originalUrl);
  console.log('[DOWNLOAD-DEBUG] Pfad:', filePath);
  if (fs.existsSync(filePath)) {
    console.log('[DOWNLOAD-DEBUG] Datei gefunden:', filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('[DOWNLOAD-DEBUG] Fehler beim Senden:', err);
        res.status(500).send('Fehler beim Download');
      }
    });
  } else {
    console.error('[DOWNLOAD-DEBUG] Datei nicht gefunden:', filePath);
    res.status(404).send('Datei nicht gefunden');
  }
});

// Statische Auslieferung für ALLE Dateien im public-Ordner (z.B. info-audio.mp3)
app.use(express.static(path.join(__dirname, 'public')));

// Statische Auslieferung für json-data (CSV- und JSON-Dateien) mit CORS-Header
app.use('/json-data', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
}, express.static(path.join(__dirname, 'public', 'json-data')));
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSV-Export-API für AdminDashboard2
app.post('/uff_2/api/export-csv', express.json(), (req, res) => {
  const { csv } = req.body;
  if (!csv) return res.status(400).json({ error: 'Keine CSV-Daten erhalten.' });
  const dirPath = path.join(__dirname, 'public', 'json-data');
  const filePath = path.join(dirPath, 'chest_aggregation_preview.csv');
  const tmpFilePath = path.join(dirPath, 'chest_aggregation_preview.csv.tmp');
  // Logging für Debug
  console.log('[CSV-Export] Schreibe Datei nach:', filePath);
  console.log('[CSV-Export] CSV-Inhalt (erster Teil):', csv ? csv.substring(0, 200) : 'leer');
  fs.mkdir(dirPath, { recursive: true }, (mkErr) => {
    if (mkErr) {
      console.error('[API] Fehler beim Anlegen des Ordners:', mkErr);
      return res.status(500).json({ error: 'Fehler beim Anlegen des Zielordners.' });
    }
    // Schreibe zuerst in temporäre Datei
    fs.writeFile(tmpFilePath, csv, 'utf8', (err) => {
      if (err) {
        if (err.code === 'EBUSY') {
          console.error('[API] Datei gesperrt (EBUSY):', err);
          return res.status(423).json({ error: 'Die CSV-Datei ist gesperrt (z.B. von Excel oder Editor geöffnet). Bitte schließe alle Programme, die die Datei verwenden, und versuche es erneut.' });
        }
        console.error('[API] Fehler beim Schreiben der temporären CSV:', err);
        return res.status(500).json({ error: 'Fehler beim Schreiben der temporären CSV.' });
      }
      // Atomar umbenennen
      fs.rename(tmpFilePath, filePath, (renameErr) => {
        if (renameErr) {
          if (renameErr.code === 'EBUSY') {
            console.error('[API] Datei gesperrt (EBUSY) beim Umbenennen:', renameErr);
            return res.status(423).json({ error: 'Die CSV-Datei ist gesperrt (z.B. von Excel oder Editor geöffnet). Bitte schließe alle Programme, die die Datei verwenden, und versuche es erneut.' });
          }
          console.error('[API] Fehler beim Umbenennen der CSV:', renameErr);
          return res.status(500).json({ error: 'Fehler beim Umbenennen der CSV.' });
        }
        res.json({ ok: true });
      });
    });
  });
});

// Datei-Upload (JSON)
const uploadDir = path.join(__dirname, 'public', 'json-data');

// Helper: Liefere den neuesten ChestData_*.json Dateinamen im uploadDir oder null
function getLatestChestDataFilename() {
  try {
    const files = fs.readdirSync(uploadDir);
    const chestFiles = files.filter(f => f.startsWith('ChestData_') && f.endsWith('.json'));
    if (chestFiles.length === 0) return null;
    // Sortiere nach Name (Timestamp enthalten) absteigend
    chestFiles.sort().reverse();
    return chestFiles[0];
  } catch (err) {
    return null;
  }
}

app.post('/upload-json', (req, res) => {
  let rawData = '';
  req.on('data', chunk => { rawData += chunk; });
  req.on('end', () => {
    try {
      // Extrahiere Datei aus multipart/form-data
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.*)$/);
      if (!boundaryMatch) throw new Error('Ungültiger Content-Type (kein boundary)');
      const boundary = boundaryMatch[1];
      const parts = rawData.split(boundary);
      const filePart = parts.find(p => p.includes('application/json'));
      if (!filePart) throw new Error('Keine JSON-Datei gefunden!');
      const jsonStart = filePart.indexOf('{');
      const jsonEnd = filePart.lastIndexOf('}') + 1;
      const jsonString = filePart.substring(jsonStart, jsonEnd);

      // Wenn client ?compat=true sendet, speichern wir weiterhin unter aktuelle_Punkte-Tabelle.json
      const url = req.url || '';
      const compat = url.includes('compat=true') || req.headers['x-compat-mode'] === '1';

      fs.mkdirSync(uploadDir, { recursive: true });
      if (compat) {
        const compatPath = path.join(uploadDir, 'aktuelle_Punkte-Tabelle.json');
        fs.writeFileSync(compatPath, jsonString);
        return res.send('JSON-Datei erfolgreich hochgeladen (compat mode)!');
      }

      // Default: speichere als ChestData_<timestamp>.json
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ChestData_${ts}.json`;
      const targetPath = path.join(uploadDir, filename);
      fs.writeFileSync(targetPath, jsonString);
      res.send(`JSON-Datei erfolgreich hochgeladen als ${filename}`);
    } catch (err) {
      console.error('[UPLOAD-ERROR]', err && err.stack ? err.stack : err);
      res.status(500).send('Fehler beim Hochladen der JSON-Datei!');
    }
  });
});
// ...existing code...

// Datei löschen
app.post('/delete-json', (req, res) => {
  try {
    if (fs.existsSync(uploadFilePath)) {
      fs.unlinkSync(uploadFilePath);
      res.send('JSON-Datei gelöscht!');
    } else {
      res.send('Keine JSON-Datei zum Löschen gefunden!');
    }
  } catch (err) {
    res.status(500).send('Fehler beim Löschen der JSON-Datei!');
  }
});

// Endpunkt zum Triggern der Aggregation
app.post('/trigger-aggregation', (req, res) => {
  const scriptPath = path.join(__dirname, 'analyze-chest-aggregation.js');
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Fehler beim Ausführen des Aggregationsskripts:', error);
      return res.status(500).send('Aggregation fehlgeschlagen!');
    }
    console.log('Aggregation erfolgreich ausgeführt.');
    res.send('Aggregation abgeschlossen!');
  });
});

app.listen(PORT, () => {
  console.log(`Aggregation-Server läuft auf Port ${PORT}`);
});
