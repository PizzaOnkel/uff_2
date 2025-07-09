// src/pages/EventArchivePage.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore'; // Firebase Firestore Imports
// Kopiere hier nur die spezifischen Lucide Icons, die die EventArchivePage verwendet!
import { Archive, Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye, Edit, Trash2, Calendar, Users, DollarSign, List, PlusCircle, Home, Upload, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in EventArchivePage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const EventArchivePage = ({ navigateTo, t, db, userId, appId, archivedPeriodId }) => {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodInfo, setPeriodInfo] = useState(null); // Für die Anzeige der Periodeninformationen

  useEffect(() => {
    if (!db) {
      console.log(t('firebaseNotReady'));
      setError(t('firebaseNotReady'));
      setLoading(false);
      return;
    }

    const fetchArchivedData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Zuerst die Periodeninformationen laden
        if (archivedPeriodId) {
          const periodDocRef = doc(db, "apps", appId, "periods", archivedPeriodId);
          const periodSnap = await getDoc(periodDocRef);
          if (periodSnap.exists()) {
            setPeriodInfo(periodSnap.data());
          } else {
            setPeriodInfo(null);
            console.warn(`Period with ID ${archivedPeriodId} not found.`);
          }
        } else {
          setPeriodInfo(null); // Keine Period-ID, also keine Periodeninformationen anzeigen
        }

        // Dann die Events dieser archivierten Periode laden
        const eventsCollectionRef = collection(db, "apps", appId, "events");
        const q = query(
          eventsCollectionRef,
          where("periodId", "==", archivedPeriodId), // Filtern nach der archivierten Periode
          orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setArchivedEvents(eventsList);
          setLoading(false);
        }, (err) => {
          console.error("Fehler beim Laden der archivierten Events:", err);
          setError(t('errorLoadingData'));
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e) {
        console.error("Fehler beim Setzen des Listeners oder Laden der Periode:", e);
        setError(t('errorLoadingData'));
        setLoading(false);
      }
    };

    if (archivedPeriodId) { // Nur laden, wenn eine archivedPeriodId vorhanden ist
      fetchArchivedData();
    } else {
      setLoading(false);
      setArchivedEvents([]); // Keine Events anzeigen, wenn keine Periode gewählt
      setError(t('noPeriodsAvailable')); // Oder eine spezifischere Meldung
    }
  }, [db, appId, archivedPeriodId, t]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <Loader className="animate-spin text-blue-400 text-6xl mx-auto mb-4" />
          <p className="text-xl text-gray-300">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <AlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigateTo('navigation')} // Geht zurück zur Navigation oder Perioden-Auswahl
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-orange-400">{t('eventArchive')}</h2>

        {periodInfo && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg text-left">
            <h3 className="text-xl font-semibold mb-2 text-gray-200">{t('archivedPeriodDetails')}</h3>
            <p className="text-gray-300">{t('name')}: {periodInfo.name}</p>
            <p className="text-gray-300">ID: {archivedPeriodId}</p>
            {/* Füge hier weitere relevante Periodeninformationen hinzu, z.B. Start-/Enddatum */}
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder={t('search') + '...'}
            className="p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full sm:w-2/3"
          />
          <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
            <Search className="inline-block mr-2" size={20} />
            {t('search')}
          </button>
        </div>

        {archivedEvents.length === 0 ? (
          <p className="text-gray-300 text-lg">{t('noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-600 text-left text-sm font-semibold text-gray-200">
                  <th className="p-3">{t('name')}</th>
                  <th className="p-3">{t('date')}</th>
                  <th className="p-3">{t('location')}</th>
                  <th className="p-3">{t('status')}</th>
                  <th className="p-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {archivedEvents.map(event => (
                  <tr key={event.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                    <td className="p-3">{event.name}</td>
                    <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-3">{event.location}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'active' ? 'bg-green-500' : event.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                        {t(event.status)}
                      </span>
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => navigateTo('archivedPeriodDetails', { eventId: event.id, periodId: archivedPeriodId })} // Beispiel: Details für archiviertes Event
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('viewDetails')}
                      >
                        <Eye size={18} />
                      </button>
                      {/* Bearbeiten und Löschen bei Archiv-Events evtl. deaktiviert oder nur für Admins */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => navigateTo('navigation')} // Oder zurück zur Perioden-Auswahl: navigateTo('periodSelection')
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default EventArchivePage;