// src/pages/InfoPage.js

import React from 'react';
import { Home, Info } from 'lucide-react'; // Stelle sicher, dass benötigte Icons importiert sind

const InfoPage = ({ navigateTo, t }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">
          {t('infoPageTitle')} {/* "Über unseren Clan und das Spiel" */}
        </h2>

        <div className="text-left mb-8">
          <h3 className="text-2xl font-semibold mb-3 text-gray-200">{t('clanName')}</h3>
          <p className="text-gray-300 text-lg mb-4">{t('clanDescription')}</p>

          <h3 className="text-2xl font-semibold mb-3 text-gray-200">{t('gameName')}</h3>
          <p className="text-gray-300 text-lg mb-4">{t('gameDescription')}</p>

          <p className="text-gray-300 text-lg mb-4">{t('gameNorms')}</p>
          <p className="text-gray-300 text-lg mb-4">{t('clanInfoLink')}</p>
          <p className="text-gray-300 text-lg mb-4">{t('contactFormHint')}</p>
          <p className="text-yellow-300 text-xl font-semibold mb-6">{t('goodLuckMessage')}</p>
          <p className="text-gray-400 text-right text-lg">{t('thePizzaOnkel')}</p>
        </div>

        {/* Button zur NavigationPage */}
        <button
          onClick={() => navigateTo('navigation')}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          <Home className="mr-2" size={24} /> {t('goToNavigation')}
        </button>

        <p className="text-gray-500 text-sm mt-8">
          © 2024 Clan-Dashboard. {t('allRightsReserved')} by PizzaOnkel.
        </p>
      </div>
    </div>
  );
};

export default InfoPage;