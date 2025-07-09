// src/pages/ArchivedPeriodDetailsPage.js

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
// Kopiere hier nur die spezifischen Lucide Icons, die die ArchivedPeriodDetailsPage verwendet!
import { Loader, AlertCircle, Home, Calendar, Users, List, Award, RefreshCw, Eye, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, Download, Upload, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in ArchivedPeriodDetailsPage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const ArchivedPeriodDetailsPage = ({ navigateTo, t, db, appId, userId, archivedPeriodId }) => {
  const [periodData, setPeriodData] = useState(null);
  const [periodEvents, setPeriodEvents] = useState([]);
  const [periodPlayers, setPeriodPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      console.log(t('firebaseNotReady'));
      setError(t('firebaseNotReady'));
      setLoading(false);
      return;
    }
    if (!archivedPeriodId) {
      setError(t('invalidPeriodId'));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Perioden-Details laden
        const periodDocRef = doc(db, "apps", appId, "periods", archivedPeriodId);
        const periodSnap = await getDoc(periodDocRef);

        if (periodSnap.exists()) {
          setPeriodData({ id: periodSnap.id, ...periodSnap.data() });
        } else {
          setError(t('periodNotFound'));
          setLoading(false);
          return;
        }

        // Events für diese archivierte Periode laden
        const eventsCollectionRef = collection(db, "apps", appId, "events");
        const qEvents = query(
          eventsCollectionRef,
          where("periodId", "==", archivedPeriodId),
          orderBy("date", "desc")
        );

        const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPeriodEvents(eventsList);
          setLoading(false); // Setze loading hier, sobald die Events da sind
        }, (err) => {
          console.error("Fehler beim Laden der Events für archivierte Periode:", err);
          setError(t('errorLoadingData'));
          setLoading(false);
        });


        // Spieler für diese archivierte Periode laden
        const playersCollectionRef = collection(db, "apps", appId, "periods", archivedPeriodId, "players");
        const qPlayers = query(
          playersCollectionRef,
          orderBy("score", "desc") // Annahme: Sortierung nach Score
        );

        const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
          const playersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPeriodPlayers(playersList);
        }, (err) => {
          console.error("Fehler beim Laden der Spieler für archivierte Periode:", err);
          // Fehler bei Spielern sollte nicht den ganzen Ladezustand blockieren, aber melden
        });


        return () => {
          unsubscribeEvents();
          unsubscribePlayers();
        };
      } catch (e) {
        console.error("Fehler beim Laden der archivierten Perioden-Details:", e);
        setError(t('errorLoadingData'));
        setLoading(false);
      }
    };

    fetchData();
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
            onClick={() => navigateTo('eventArchive')} // Zurück zum Event-Archiv
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!periodData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <p className="text-xl text-gray-300">{t('periodNotFound')}</p>
          <button
            onClick={() => navigateTo('eventArchive')}
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
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-pink-400">{t('archivedPeriodDetails')}</h2>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg text-left">
          <p className="text-gray-300 text-lg flex items-center mb-2">
            <Calendar className="mr-2" size={20} />
            <span className="font-semibold">{t('name')}:</span> {periodData.name}
          </p>
          <p className="text-gray-300 text-lg flex items-center mb-2">
            <List className="mr-2" size={20} />
            <span className="font-semibold">ID:</span> {periodData.id}
          </p>
          {periodData.startDate && <p className="text-gray-300 text-lg flex items-center mb-2">
            <Calendar className="mr-2" size={20} />
            <span className="font-semibold">{t('startDate')}:</span> {new Date(periodData.startDate).toLocaleDateString()}
          </p>}
          {periodData.endDate && <p className="text-gray-300 text-lg flex items-center mb-2">
            <Calendar className="mr-2" size={20} />
            <span className="font-semibold">{t('endDate')}:</span> {new Date(periodData.endDate).toLocaleDateString()}
          </p>}
          {/* Füge hier weitere Periodendetails hinzu */}
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-200">{t('eventsInPeriod')}</h3>
        {periodEvents.length === 0 ? (
          <p className="text-gray-300 text-lg">{t('noEventsForPeriod')}</p>
        ) : (
          <div className="overflow-x-auto mb-6">
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
                {periodEvents.map(event => (
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
                        onClick={() => console.log('View archived event details', event.id)} // Evtl. Detailseite für archivierte Events
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('viewDetails')}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="text-2xl font-bold mb-4 text-gray-200">{t('playersInPeriod')}</h3>
        {periodPlayers.length === 0 ? (
          <p className="text-gray-300 text-lg">{t('noPlayersForPeriod')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-600 text-left text-sm font-semibold text-gray-200">
                  <th className="p-3">{t('name')}</th>
                  <th className="p-3">Score</th> {/* Annahme: Feld 'score' */}
                  <th className="p-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {periodPlayers.map(player => (
                  <tr key={player.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                    <td className="p-3">{player.name}</td>
                    <td className="p-3">{player.score || 'N/A'}</td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => navigateTo('playerDetails', { playerId: player.id, periodId: archivedPeriodId })} // Zur PlayerDetailsPage navigieren
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('viewDetails')}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        <button
          onClick={() => navigateTo('eventArchive')} // Zurück zum Event-Archiv
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default ArchivedPeriodDetailsPage;