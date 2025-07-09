// src/pages/AdminPanelPage.js

import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Firebase Firestore Imports
// Kopiere hier nur die spezifischen Lucide Icons, die die AdminPanelPage verwendet!
import { Upload, CheckCircle2, XCircle, Loader, AlertCircle, RefreshCw, Home, Search, Filter, ChevronDown, ChevronUp, Eye, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in AdminPanelPage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const AdminPanelPage = ({ navigateTo, t, db, appId, userId }) => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'success', 'failed', ''
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedJsonData, setUploadedJsonData] = useState(null); // Zum Anzeigen der hochgeladenen Daten

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('');
    setStatusMessage('');
    setUploadedJsonData(null);
  };

  const processPeriodData = async (data, periodId, isUpdate = false) => {
    const periodRef = doc(db, "apps", appId, "periods", periodId);

    // Daten für die Periode vorbereiten
    const periodData = {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      lastUpdated: serverTimestamp()
    };

    if (isUpdate) {
      await updateDoc(periodRef, periodData);
    } else {
      await setDoc(periodRef, periodData); // setDoc statt addDoc, um ID zu verwenden
    }

    // Spielerdaten verarbeiten
    if (data.players && Array.isArray(data.players)) {
      for (const player of data.players) {
        const playerRef = doc(db, "apps", appId, "periods", periodId, "players", player.id);
        await setDoc(playerRef, {
          ...player,
          lastUpdated: serverTimestamp()
        });
      }
    }

    // Eventdaten verarbeiten
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        const eventRef = doc(db, "apps", appId, "events", event.id); // Events auf App-Ebene speichern
        await setDoc(eventRef, {
          ...event,
          periodId: periodId, // Zugehörigkeit zur Periode
          lastUpdated: serverTimestamp()
        });
      }
    }
  };


  const handleFileUpload = async () => {
    if (!file) {
      setStatusMessage(t('pleaseChooseFile'));
      setUploadStatus('failed');
      return;
    }

    if (file.type !== 'application/json') {
      setStatusMessage(t('onlyJsonFilesAllowed'));
      setUploadStatus('failed');
      return;
    }

    setUploadStatus('uploading');
    setStatusMessage(t('uploading'));

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setUploadedJsonData(jsonData); // Zeigt die hochgeladenen Daten an

        if (!db) {
          setStatusMessage(t('firebaseNotReady'));
          setUploadStatus('failed');
          return;
        }

        // Annahme: Die JSON-Datei enthält ein 'periodId'-Feld auf der obersten Ebene
        // und optionale Felder wie 'name', 'startDate', 'endDate', 'players', 'events'.
        const { id: periodId, ...rest } = jsonData;

        if (!periodId) {
          setStatusMessage(t('invalidJsonFormat') + ' ' + t('noPeriodId')); // Füge spezifischen Fehler hinzu
          setUploadStatus('failed');
          return;
        }

        // Überprüfen, ob die Periode bereits existiert
        const periodDocRef = doc(db, "apps", appId, "periods", periodId);
        const periodSnap = await getDoc(periodDocRef);

        if (periodSnap.exists()) {
          // Periode existiert, aktualisiere sie
          await processPeriodData(jsonData, periodId, true);
          setStatusMessage(t('jsonSavedSuccessfully') + ' ' + t('updatedExistingPeriod'));
        } else {
          // Neue Periode
          await processPeriodData(jsonData, periodId, false);
          setStatusMessage(t('jsonSavedSuccessfully') + ' ' + t('addedNewPeriod'));
        }

        setUploadStatus('success');
        // Optional: Nach erfolgreichem Upload navigieren oder Datei-Input zurücksetzen
        setFile(null); // Dateiauswahl zurücksetzen
      } catch (jsonError) {
        console.error("Fehler beim Parsen/Verarbeiten der JSON-Datei:", jsonError);
        setStatusMessage(t('invalidJsonFormat') + ' ' + jsonError.message);
        setUploadStatus('failed');
      }
    };

    reader.onerror = () => {
      setStatusMessage(t('errorReadingFile'));
      setUploadStatus('failed');
    };

    reader.readAsText(file);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-red-400">{t('adminPanel')}</h2>

        <div className="mb-4">
          <label htmlFor="json-upload" className="block text-gray-300 text-sm font-bold mb-2">
            {t('uploadJsonFile')}
          </label>
          <input
            type="file"
            id="json-upload"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleFileUpload}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-lg"
          disabled={uploadStatus === 'uploading'}
        >
          {uploadStatus === 'uploading' ? (
            <>
              <Loader className="animate-spin inline-block mr-2" size={20} /> {t('uploading')}
            </>
          ) : (
            <>
              <Upload className="inline-block mr-2" size={20} /> {t('uploadFile')}
            </>
          )}
        </button>

        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md ${uploadStatus === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {uploadStatus === 'success' && <CheckCircle2 className="inline-block mr-2" size={20} />}
            {uploadStatus === 'failed' && <XCircle className="inline-block mr-2" size={20} />}
            {statusMessage}
          </div>
        )}

        {uploadedJsonData && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-left max-h-60 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2 text-gray-200">{t('uploadedJsonData')}</h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap break-all">{JSON.stringify(uploadedJsonData, null, 2)}</pre>
          </div>
        )}

        <button
          onClick={() => navigateTo('navigation')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default AdminPanelPage;