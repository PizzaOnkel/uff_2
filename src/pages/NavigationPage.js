// src/pages/NavigationPage.js

import React, { useState, useEffect } from 'react';
// Importiere die spezifischen Lucide Icons, die in dieser Navigationsseite verwendet werden
import { Home, Users, Trophy, Archive, Settings, Mail, Info, Calendar, Clock, DollarSign, List, PlusCircle, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, RefreshCw, Download, Upload, Eye, EyeOff, User, Lock, LogIn, LogOut, Loader, AlertCircle, CheckCircle2, XCircle, BarChart, LineChart, PieChart, TrendingUp, TrendingDown, Clipboard, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react';
// Importiere die ausgelagerten Seiten, die diese Navigation rendert:
import CurrentTotalEventPage from './CurrentTotalEventPage.js';
import EventArchivePage from './EventArchivePage.js';
import TopTenPage from './TopTenPage.js';
import AdminPanelPage from './AdminPanelPage.js';

const NavigationPage = ({ navigateTo, t, db, userId, appId }) => {
  const [selectedInnerPage, setSelectedInnerPage] = useState('currentTotalEvent'); // Standard: Aktuelle Events anzeigen

  const renderInnerPage = () => {
    switch (selectedInnerPage) {
      case 'currentTotalEvent':
        return <CurrentTotalEventPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'eventArchive':
        return <EventArchivePage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} archivedPeriodId={"examplePeriodId"} />; // Hier "examplePeriodId" durch die tatsächliche ID ersetzen oder aus dem Zustand/Props holen
      case 'topTen':
        return <TopTenPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} periodId={"examplePeriodId"} />; // Hier "examplePeriodId" durch die tatsächliche ID ersetzen
      case 'adminPanel':
        return <AdminPanelPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'info':
          navigateTo('info'); // Wenn InfoPage direkt über App.js gerendert wird
          return null; // Oder direkte Anzeige hier, falls InfoPage klein genug ist
      // Weitere Fälle für andere Innenseiten der Navigation
      default:
        return <p>{t('pageNotFound')}</p>; // Oder eine Standardseite
    }
  };


  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-400 text-center">{t('navigation')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setSelectedInnerPage('currentTotalEvent')}
            className={`flex items-center justify-center p-4 rounded-lg shadow-md transition-all duration-200
              ${selectedInnerPage === 'currentTotalEvent' ? 'bg-green-600 hover:bg-green-700 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'} text-lg`}
          >
            <Calendar className="mr-2" size={24} /> {t('currentEvents')}
          </button>
          <button
            onClick={() => setSelectedInnerPage('eventArchive')}
            className={`flex items-center justify-center p-4 rounded-lg shadow-md transition-all duration-200
              ${selectedInnerPage === 'eventArchive' ? 'bg-orange-600 hover:bg-orange-700 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'} text-lg`}
          >
            <Archive className="mr-2" size={24} /> {t('eventArchive')}
          </button>
          <button
            onClick={() => setSelectedInnerPage('topTen')}
            className={`flex items-center justify-center p-4 rounded-lg shadow-md transition-all duration-200
              ${selectedInnerPage === 'topTen' ? 'bg-purple-600 hover:bg-purple-700 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'} text-lg`}
          >
            <Trophy className="mr-2" size={24} /> {t('topTen')}
          </button>
          <button
            onClick={() => setSelectedInnerPage('adminPanel')}
            className={`flex items-center justify-center p-4 rounded-lg shadow-md transition-all duration-200
              ${selectedInnerPage === 'adminPanel' ? 'bg-red-600 hover:bg-red-700 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'} text-lg`}
          >
            <Settings className="mr-2" size={24} /> {t('adminPanel')}
          </button>
          {/* Falls InfoPage auch in der Navigation ist */}
          <button
            onClick={() => navigateTo('info')} // Direkte Navigation zur InfoPage über App.js
            className={`flex items-center justify-center p-4 rounded-lg shadow-md transition-all duration-200
              ${selectedInnerPage === 'info' ? 'bg-blue-600 hover:bg-blue-700 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'} text-lg`}
          >
            <Info className="mr-2" size={24} /> {t('info')}
          </button>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8">
          {renderInnerPage()}
        </div>

        <button
          onClick={() => navigateTo('welcome')} // Zurück zur Begrüßungsseite
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg"
        >
          {t('goBackToWelcome')}
        </button>
      </div>
    </div>
  );
};

export default NavigationPage;