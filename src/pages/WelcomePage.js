// src/pages/WelcomePage.js

import React, { useState } from 'react'; // Stelle sicher, dass benötigte Hooks importiert werden
import { Home, Users, Trophy, Mail, Settings, Target, Calendar, Clock, Download, Upload, Eye, EyeOff, User, Lock, LogIn, LogOut, Bell, MessageSquare, Shield, Key, Database, Server, Cloud, HardDrive, Activity, Zap, Sun, Moon, Star, Heart, Award, Gift, Camera, Image, Video, Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Headphones, Speaker, Monitor, Laptop, Tablet, Smartphone, MonitorDot, Tv, Printer, Scan, QrCode, Barcode, Wifi, Bluetooth, Globe, Map, Compass, Navigation, Pin, MapPin, Anchor, Flag, Book, Bookmark, FileText, Folder, FolderOpen, Paperclip, Link, ExternalLink, Code, Terminal, Command, Hash, AtSign, Euro, PoundSterling, Yen, Bitcoin, CreditCard, Banknote, Receipt, ShoppingCart, ShoppingBag, Package, Box, Truck, Plane, Ship, Car, Bike, Train, Bus, Rocket, FlaskConical, LifeBuoy, Umbrella, Leaf, CloudRain, Wind, Droplet, Thermometer, CloudFog, CloudLightning, CloudSnow, SunMoon, Sunrise, Sunset, MoonStar, CloudDrizzle, CloudSun, CloudMoon, Tornado, Waves, CloudOff, CloudUpload, CloudDownload, CloudUploadCloud, CloudDownloadCloud } from 'lucide-react'; // KOPPIERE NUR DIE ICONS, DIE WELCOMEPAGE TATSÄCHLICH BENÖTIGT
// ... weitere Imports, falls die WelcomePage welche hat (z.B. Context)

/**
 * @function WelcomePage
 * @description Startseite der Anwendung. Ermöglicht die Auswahl der Sprache und die Navigation zur Informationsseite.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.setLanguage - Setter-Funktion zum Ändern der aktuellen Sprache.
 * @param {string} props.currentLanguage - Die aktuell ausgewählte Sprache.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der WelcomePage.
 */
const WelcomePage = ({ navigateTo, setLanguage, currentLanguage, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">{t('welcomeTitle')}</h1>
      <div className="mb-6">
        <label htmlFor="language-select" className="block text-gray-300 text-lg mb-2">{t('selectLanguage')}</label>
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ru">Русский</option>
          <option value="it">Italiano</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <button
        onClick={() => navigateTo('info')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
      >
        <Info className="w-6 h-6 text-blue-300 mr-2" />
        {t('goToInfoPage')}
      </button>
    </div>
  </div>
);