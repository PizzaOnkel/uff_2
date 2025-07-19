import React from "react";
// import entfernt, da kein Router mehr verwendet wird

export default function NavigationPage({ t, setCurrentPage }) {
  // Hilfsfunktion für Button-Styles
  function getButtonBgClasses(color, isRed = false) {
    if (isRed) return "bg-red-900/40 hover:bg-red-800/50 border-red-700";
    switch (color) {
      case "green": return "bg-green-900/30 hover:bg-green-800/40 border-green-800";
      case "yellow": return "bg-yellow-900/30 hover:bg-yellow-800/40 border-yellow-800";
      case "blue": return "bg-blue-900/30 hover:bg-blue-800/40 border-blue-800";
      case "red": return "bg-red-900/30 hover:bg-red-800/40 border-red-800";
      case "purple": return "bg-purple-900/30 hover:bg-purple-800/40 border-purple-800";
      case "orange": return "bg-orange-900/30 hover:bg-orange-800/40 border-orange-800";
      case "teal": return "bg-teal-900/30 hover:bg-teal-800/40 border-teal-800";
      case "indigo": return "bg-indigo-900/30 hover:bg-indigo-800/40 border-indigo-800";
      default: return "bg-gray-800/30 hover:bg-gray-700/40 border-gray-700";
    }
  }

  // SVG-Icons als React-Komponenten
  const icons = {
    Calendar: <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    ListTodo: <svg className="w-12 h-12 text-yellow-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3" y2="6" /><line x1="3" y1="12" x2="3" y2="12" /><line x1="3" y1="18" x2="3" y2="18" /></svg>,
    Archive: <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="4" /><rect x="3" y="7" width="18" height="14" /><line x1="9" y1="12" x2="15" y2="12" /></svg>,
    Award: <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    Trophy: <svg className="w-12 h-12 text-purple-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M17 4v6a5 5 0 0 1-10 0V4" /><path d="M4 4v6a7.002 7.002 0 0 0 7 7 7.002 7.002 0 0 0 7-7V4" /></svg>,
    Mail: <svg className="w-12 h-12 text-orange-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></svg>,
    Shield: <svg className="w-12 h-12 text-white mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    ArrowLeft: <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-6 pb-8 w-full">
      <h2 className="text-4xl font-bold mb-10 text-center text-blue-400 mt-12">
        {t.navigationTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        {/* Buttons */}
        <button onClick={() => setCurrentPage("currentTotalEvent")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("green")}`}> 
          {icons.Calendar}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.currentEventPeriod}</span>
          <span className="text-sm text-gray-400 text-center">{t.currentEventPeriodDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("standardsEvaluation")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("yellow")}`}> 
          {icons.ListTodo}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.standardsEvaluation}</span>
          <span className="text-sm text-gray-400 text-center">{t.standardsEvaluationDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("eventArchive")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("blue")}`}> 
          {icons.Archive}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.eventArchive}</span>
          <span className="text-sm text-gray-400 text-center">{t.eventArchiveDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("topTen")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("red")}`}> 
          {icons.Award}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.topTen}</span>
          <span className="text-sm text-gray-400 text-center">{t.topTenDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("hallOfChampions")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("purple")}`}> 
          {icons.Trophy}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.hallOfChampions}</span>
          <span className="text-sm text-gray-400 text-center">{t.hallOfChampionsDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("contactForm")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("orange")}`}> 
          {icons.Mail}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.contactForm}</span>
          <span className="text-sm text-gray-400 text-center">{t.contactFormDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("adminPanel")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("white", true)}`}> 
          {icons.Shield}
          <span className="text-xl font-semibold text-white text-center mb-1">{t.adminPanel}</span>
          <span className="text-sm text-gray-200 text-center">{t.adminPanelDesc}</span>
        </button>
        <button onClick={() => setCurrentPage("adminRegistration")} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border ${getButtonBgClasses("green")}`}> 
          <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">Admin werden</span>
          <span className="text-sm text-gray-400 text-center">Beantrage Admin-Zugang für das Dashboard</span>
        </button>
      </div>
      {/* Zurück zur Info-Seite Button */}
      <button onClick={() => setCurrentPage("info")} className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 mb-12">
        {icons.ArrowLeft} {t.backToInfo}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}