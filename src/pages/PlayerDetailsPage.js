// src/pages/PlayerDetailsPage.js

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
// Kopiere hier nur die spezifischen Lucide Icons, die die PlayerDetailsPage verwendet!
import { Loader, AlertCircle, Home, User, Gamepad, Award, DollarSign, RefreshCw, Eye, Edit, Trash2, Calendar, Users, List, PlusCircle, Search, Filter, ChevronDown, ChevronUp, Download, Upload, EyeOff, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in PlayerDetailsPage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const PlayerDetailsPage = ({ navigateTo, t, db, appId, userId, periodId, playerId }) => {
  const [playerData, setPlayerData] = useState(null);
  const [playerEvents, setPlayerEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      console.log(t('firebaseNotReady'));
      setError(t('firebaseNotReady'));
      setLoading(false);
      return;
    }
    if (!playerId || !periodId) {
      setError(t('invalidPlayerOrPeriodId'));
      setLoading(false);
      return;
    }

    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Spielerdaten laden
        const playerDocRef = doc(db, "apps", appId, "periods", periodId, "players", playerId);
        const playerSnap = await getDoc(playerDocRef);

        if (playerSnap.exists()) {
          setPlayerData({ id: playerSnap.id, ...playerSnap.data() });
        } else {
          setError(t('playerNotFound'));
          setLoading(false);
          return;
        }

        // Events des Spielers laden (angenommen, Events haben ein Feld 'playerIds' oder 'participants' das den Spieler enthält)
        const eventsCollectionRef = collection(db, "apps", appId, "events");
        // Dies ist ein Beispiel-Query. Passe es an deine tatsächliche Datenstruktur an.
        // Angenommen, jedes Event hat ein Array 'participants' mit Spieler-IDs.
        const q = query(
          eventsCollectionRef,
          orderBy("date", "desc") // Sortierung anpassen
          // Hier müsste eine where-Klausel hin, um Events dieses Spielers zu finden.
          // Beispiel: where("participants", "array-contains", playerId)
          // Dies setzt voraus, dass playerId in einem Array-Feld im Event gespeichert ist.
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const eventsList = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(event => event.participants && event.participants.includes(playerId)); // Filtere clientseitig, wenn keine Array-Contains-Abfrage möglich
          setPlayerEvents(eventsList);
          setLoading(false);
        }, (err) => {
          console.error("Fehler beim Laden der Spieler-Events:", err);
          setError(t('errorLoadingData'));
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e) {
        console.error("Fehler beim Laden der Spielerdetails:", e);
        setError(t('errorLoadingData'));
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [db, appId, periodId, playerId, t]);

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
            onClick={() => navigateTo('navigation')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <p className="text-xl text-gray-300">{t('playerNotFound')}</p>
          <button
            onClick={() => navigateTo('navigation')}
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
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-yellow-400">{t('playerDetails')}</h2>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg text-left">
          <p className="text-gray-300 text-lg flex items-center mb-2">
            <User className="mr-2" size={20} />
            <span className="font-semibold">{t('name')}:</span> {playerData.name}
          </p>
          <p className="text-gray-300 text-lg flex items-center mb-2">
            <Gamepad className="mr-2" size={20} />
            <span className="font-semibold">ID:</span> {playerData.id}
          </p>
          <p className="text-gray-300 text-lg flex items-center mb-2">
            <Award className="mr-2" size={20} />
            <span className="font-semibold">Score:</span> {playerData.score || 'N/A'}
          </p>
          {/* Füge hier weitere Spielerdetails hinzu */}
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-200">{t('playerEvents')}</h3>
        {playerEvents.length === 0 ? (
          <p className="text-gray-300 text-lg">{t('noEventsForPlayer')}</p>
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
                {playerEvents.map(event => (
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
                        onClick={() => navigateTo('eventDetails', { eventId: event.id, periodId: periodId })} // Beispiel: Event-Details
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
          onClick={() => navigateTo('navigation')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;