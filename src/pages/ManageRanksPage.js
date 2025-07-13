import React from "react";
import { ROUTES } from "../routes";

export default function ManageRanksPage({ t, setCurrentPage }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{t.manageRanksTitle}</h2>
      <p className="text-xl text-gray-300 mb-8 text-center">{t.comingSoon}</p>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 mb-12"
      >
        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}