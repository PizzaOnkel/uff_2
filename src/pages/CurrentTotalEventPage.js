// src/pages/CurrentTotalEventPage.js

import React, { useState, useEffect } from 'react'; // Stelle sicher, dass benötigte Hooks importiert werden
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'; // Firebase Firestore Imports, falls benötigt
// Kopiere hier nur die spezifischen Lucide Icons, die die CurrentTotalEventPage verwendet!
import { Calendar, Users, DollarSign, List, PlusCircle, Edit, Trash2, Home, Search, Filter, ChevronDown, ChevronUp, RefreshCw, Upload, Eye, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Falls useFirebase in CurrentTotalEventPage direkt verwendet wird:
// import { useFirebase } from '../FirebaseContext.js';


const CurrentTotalEventPage = ({ navigateTo, t, db, userId, appId, periodId, playerId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      console.log(t('firebaseNotReady'));
      setError(t('firebaseNotReady'));
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventsCollectionRef = collection(db, "apps", appId, "events");
        // Beispiel-Query: Hole Events, die noch nicht abgeschlossen sind
        const q = query(eventsCollectionRef, orderBy("date", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEvents(eventsList);
          setLoading(false);
        }, (err) => {
          console.error("Fehler beim Laden der Events:", err);
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

    fetchEvents();
  }, [db, appId, t]); // Abhängigkeiten aktualisieren

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
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-green-400">{t('currentEvents')}</h2>
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

        {events.length === 0 ? (
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
                  <th className="p-3">{t('actions')}</th> {/* Annahme, dass 'actions' übersetzt wird */}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
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
                        onClick={() => console.log('View details for', event.id)}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('viewDetails')}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => console.log('Edit', event.id)}
                        className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200"
                        title={t('edit')}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => console.log('Delete', event.id)}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
                        title={t('delete')}
                      >
                        <Trash2 size={18} />
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

export default CurrentTotalEventPage;