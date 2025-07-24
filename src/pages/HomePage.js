import React from "react";
// import entfernt, da kein Router mehr verwendet wird

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
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-4 pb-8">
      <div className="text-center mb-10 mt-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
          {t.welcome}
        </h1>
      </div>

      {/* Sprachauswahl */}
      <div className="mb-10 flex flex-col items-center">
        <p className="text-lg text-gray-300 mb-4">{t.chooseLanguage}</p>
        <div className="flex space-x-3">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                language === l.code
                  ? "bg-blue-700 shadow-md"
                  : "bg-gray-700 hover:bg-gray-600"
              } text-2xl`}
              title={l.title}
            >
              {l.flag}
            </button>
          ))}
        </div>
      </div>

      {/* Weiter-Button */}
      <button
        onClick={() => setCurrentPage("info")}
        className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 w-48 h-32 bg-blue-900/30 hover:bg-blue-800/40 border-blue-800"
      >
        {/* Icon */}
        <svg
          className="w-12 h-12 text-blue-400 mb-2"
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
        <span className="text-xl font-semibold text-white text-center mb-1">
          {t.continueButton}
        </span>
      </button>

      {/* Copyright */}
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}