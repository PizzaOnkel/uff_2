// src/pages/TopTenPage.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore'; // Firebase Firestore Imports
// Kopiere hier nur die spezifischen Lucide Icons, die die TopTenPage verwendet!
import { Trophy, Search, Filter, RefreshCw, BarChart, Eye, ChevronDown, ChevronUp, Users, Clock, Download, Upload, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in TopTenPage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const TopTenPage = ({ navigateTo, t, db, appId, userId, periodId }) => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      console.log(t('firebaseNotReady'));
      setError(t('firebaseNotReady'));
      setLoading(false);
      return;
    }

    if (!periodId) {
      // Keine periodId ausgewählt, informiere den Benutzer oder navigiere zurück zur Perioden-Auswahl
      setError(t('noPeriodsAvailable')); // Hier kann eine spezifischere Meldung stehen
      setLoading(false);
      return;
    }

    const fetchTopPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const playersCollectionRef = collection(db, "apps", appId, "periods", periodId, "players");
        // Beispiel: Top 10 Spieler nach 'score' sortiert
        const q = query(
          playersCollectionRef,
          orderBy("score", "desc"), // Annahme: Es gibt ein Feld 'score'
          limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const playersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTopPlayers(playersList);
          setLoading(false);
        }, (err) => {
          console.error("Fehler beim Laden der Top 10 Spieler:", err);
          setError(t('errorLoadingData'));
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e) {
        console.error("Fehler beim Setzen des Listeners:", e);
        setError(t('errorLoadingData'));
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, [db, appId, periodId, t]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-purple-400">{t('topTen')}</h2>

        {topPlayers.length === 0 ? (
          <p className="text-gray-300 text-lg">{t('noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-600 text-left text-sm font-semibold text-gray-200">
                  <th className="p-3">#</th>
                  <th className="p-3">{t('name')}</th>
                  <th className="p-3">Score</th> {/* Annahme: Feld 'score' */}
                  <th className="p-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-600 transition-colors duration-150">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{player.name}</td>
                    <td className="p-3">{player.score || 'N/A'}</td> {/* Annahme: player.score */}
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => navigateTo('playerDetails', { playerId: player.id, periodId: periodId })}
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

export default TopTenPage;