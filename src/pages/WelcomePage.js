// src/pages/WelcomePage.js

import React from 'react';
import { LogIn, User, Globe } from 'lucide-react'; // Imports für benötigte Icons

const WelcomePage = ({ navigateTo, setLanguage, currentLanguage, t }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-green-400">
          {t('welcomeToClanDashboard')}
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          {t('chooseYourLanguage')}
        </p>

        <div className="mb-8 relative">
          <label htmlFor="language-select" className="sr-only">
            {t('selectLanguage')}
          </label>
          <div className="relative">
            <select
              id="language-select"
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="block w-full py-3 pl-10 pr-4 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none cursor-pointer"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
              <option value="ru">Русский</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Globe className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigateTo('navigation')}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg mb-4 flex items-center justify-center"
        >
          <User className="mr-2" size={24} /> {t('enterDashboard')}
        </button>

        <button
          onClick={() => navigateTo('auth')}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg flex items-center justify-center"
        >
          <LogIn className="mr-2" size={24} /> {t('loginRegister')}
        </button>

      </div>
    </div>
  );
};

export default WelcomePage;