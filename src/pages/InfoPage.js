// src/pages/InfoPage.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'; // Firebase Firestore Imports
import { Info, Users, Clock, Download, Upload, Eye, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react'; // Kopiere nur die spezifischen Icons, die die InfoPage tatsächlich verwendet!
import { useFirebase } from '../FirebaseContext.js'; // Pfad anpassen, falls nötig

const InfoPage = ({ navigateTo, t, db, appId, userId, periodId, playerId }) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState("disconnected"); // Beispielstatus
  const [dataSyncStatus, setDataSyncStatus] = useState("syncing"); // Beispielstatus
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString()); // Beispielstatus

  // Simulation von Daten und Status für die InfoPage
  useEffect(() => {
    // Hier würdest du normalerweise echten Firebase-Status oder Daten-Sync-Status überwachen
    const interval = setInterval(() => {
      setFirebaseStatus(Math.random() > 0.1 ? "connected" : "disconnected");
      setDataSyncStatus(Math.random() > 0.5 ? "syncing" : "completed");
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 5000); // Aktualisiert alle 5 Sekunden

    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = () => {
    console.log(t('diagnosticsInProgress'));
    // Hier würde die echte Diagnose-Logik stehen
    // Simuliere einen Ladevorgang
    setDataSyncStatus("syncing");
    setTimeout(() => {
      setDataSyncStatus("completed");
      console.log("Diagnose abgeschlossen.");
    }, 2000);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">{t('infoPageTitle')}</h2>

        <div className="mb-4 text-left">
          <h3 className="text-xl font-semibold mb-2">{t('appInfo')}</h3>
          <p className="text-gray-300 mb-1">{t('appId')}: <span className="font-mono text-sm bg-gray-700 p-1 rounded">{appId}</span></p>
          <p className="text-gray-300 mb-1">{t('userId')}: <span className="font-mono text-sm bg-gray-700 p-1 rounded">{userId || t('loadingUser')}</span></p>
          <p className="text-gray-300 mb-1">{t('version')}: 1.0.0</p>
          <p className="text-gray-300 mb-1">{t('build')}: 20240101.1</p>
        </div>

        <div className="mb-4 text-left">
          <h3 className="text-xl font-semibold mb-2">{t('firebaseStatus')}</h3>
          <p className="text-gray-300 mb-1">{t('databaseConnection')}: <span className={`font-semibold ${firebaseStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>{t(firebaseStatus)}</span></p>
          <p className="text-gray-300 mb-1">{t('dataSyncStatus')}: <span className={`font-semibold ${dataSyncStatus === 'syncing' ? 'text-yellow-400' : 'text-green-400'}`}>{t(dataSyncStatus)}</span></p>
          <p className="text-gray-300 mb-1">{t('lastSync')}: {lastSyncTime}</p>
          <button
            onClick={runDiagnostics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            disabled={dataSyncStatus === "syncing"}
          >
            {t('runDiagnostics')}
          </button>
        </div>

        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="mt-6 mb-4 px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
        >
          {showDebugInfo ? t('hideDebugInfo') : t('showDebugInfo')}
        </button>

        {showDebugInfo && (
          <div className="bg-gray-700 p-4 rounded-lg text-left mt-4">
            <h3 className="text-xl font-semibold mb-2 text-red-400">{t('debugInfo')}</h3>
            <p className="text-gray-300 text-sm">Path: /info</p>
            <p className="text-gray-300 text-sm">Period ID: {periodId || 'N/A'}</p>
            <p className="text-gray-300 text-sm">Player ID: {playerId || 'N/A'}</p>
            {/* Weitere Debug-Informationen können hier hinzugefügt werden */}
          </div>
        )}

        <button
          onClick={() => navigateTo('welcome')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default InfoPage;