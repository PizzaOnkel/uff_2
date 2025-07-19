
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Datei-Upload (JSON)
const uploadDir = path.join(__dirname, 'public', 'json-data');
const uploadFilePath = path.join(uploadDir, 'aktuelle_Punkte-Tabelle.json');

app.post('/upload-json', (req, res) => {
  let rawData = '';
  req.on('data', chunk => { rawData += chunk; });
  req.on('end', () => {
    try {
      // Extrahiere Datei aus multipart/form-data
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const parts = rawData.split(boundary);
      const filePart = parts.find(p => p.includes('application/json'));
      if (!filePart) throw new Error('Keine JSON-Datei gefunden!');
      const jsonStart = filePart.indexOf('{');
      const jsonEnd = filePart.lastIndexOf('}') + 1;
      const jsonString = filePart.substring(jsonStart, jsonEnd);
      fs.writeFileSync(uploadFilePath, jsonString);
      res.send('JSON-Datei erfolgreich hochgeladen!');
    } catch (err) {
      res.status(500).send('Fehler beim Hochladen der JSON-Datei!');
    }
  });
});

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
