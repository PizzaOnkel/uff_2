import React from "react";

export default function HomePage({ t, language, setLanguage, setCurrentPage }) {
  const langs = [
    { code: "de", flag: "🇩🇪", title: "Deutsch" },
    { code: "en", flag: "🇬🇧", title: "English" },
    { code: "fr", flag: "🇫🇷", title: "Français" },
    { code: "es", flag: "🇪🇸", title: "Español" },
    { code: "it", flag: "🇮🇹", title: "Italiano" },
    { code: "ru", flag: "🇷🇺", title: "Русский" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-32 md:w-48 bg-gray-800/80 border-r border-gray-700 p-2 md:p-4 flex flex-col gap-2 md:gap-3 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
          P.O. & Friends
        </h2>
        
        <div className="border-t border-gray-700 pt-2 md:pt-3 flex flex-col gap-2">
          <button
            onClick={() => setCurrentPage('artistProfile')}
            className="w-full px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-xs"
          >
            👤 {t.artistButtonText || 'Artist'}
          </button>
          
          <button
            onClick={() => setCurrentPage('projects')}
            className="w-full px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-800 transition-all duration-200 text-purple-300 hover:text-purple-200 text-xs"
          >
            🎵 {t.projectsButtonText || 'Projects'}
          </button>
        </div>
      </div>

      {/* Main Content - Rechts */}
      <div className="flex-1 p-2 md:p-6 overflow-y-auto">
        <div className="text-center mb-6 mt-auto flex flex-col items-center justify-center min-h-64 md:min-h-80">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            {t.welcome}
          </h1>
        </div>

        {/* Sprachauswahl */}
        <div className="mb-6 flex flex-col items-center">
          <p className="text-sm md:text-base text-gray-300 mb-3">{t.chooseLanguage}</p>
          <div className="flex space-x-2">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  language === l.code
                    ? "bg-blue-700 shadow-md"
                    : "bg-gray-700 hover:bg-gray-600"
                } text-xl md:text-2xl`}
                title={l.title}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>

        {/* Weiter-Button */}
        <div className="flex justify-center mb-auto pb-6 md:pb-10">
          <button
            onClick={() => setCurrentPage("artistProfile")}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 w-32 md:w-40 h-24 md:h-28 bg-blue-900/30 hover:bg-blue-800/40 border-blue-800"
          >
            {/* Icon */}
            <svg
              className="w-8 md:w-10 h-8 md:h-10 text-blue-400 mb-1.5"
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
            <span className="text-base md:text-lg font-semibold text-white text-center mb-1">
              {t.continueButton}
            </span>
          </button>
        </div>

        {/* Copyright */}
        <footer className="text-gray-500 text-xs md:text-sm text-center pb-4">{t.copyright}</footer>
      </div>
    </div>
  );
}