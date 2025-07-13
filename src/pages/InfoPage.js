import React from "react";
import { ROUTES } from "../routes";

export default function InfoPage({ t, setCurrentPage }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-6 pb-8 w-full">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl w-full mt-12 mb-8 border border-gray-700">
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">
          {t.infoTitle}
        </h2>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2 text-purple-400">{t.clanName}</h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{t.clanDescription}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2 text-purple-400">{t.gameTitle}</h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{t.gameDescription}</p>
        </div>
        <p className="text-gray-300 mb-4 leading-relaxed">{t.normsInfo}</p>
        <p className="text-gray-300 mb-4 leading-relaxed">{t.playerInfo}</p>
        <p className="text-gray-300 mb-6 leading-relaxed">{t.contactInfo}</p>
        <p className="text-gray-300 text-lg italic text-center mb-6 whitespace-pre-line">{t.goodLuck}</p>
        <p className="text-right text-blue-300 font-medium">{t.signature}</p>
      </div>
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 mb-12"
      >
        {/* Icon */}
        <svg
          className="mr-3 w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        {t.backToNavigation}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}