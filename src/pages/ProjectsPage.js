import React from 'react';

export default function ProjectsPage({ t, language, setCurrentPage }) {
  // Projekte Liste mit echten Daten
  const projects = [
    { 
      id: 1, 
      name: "We Stand Together", 
      cover: "/musik/We_Stand_Together/Front_Cover.PNG", 
      status: "Verfügbar",
      route: "projectWeStandTogether"
    },
    {
      id: 2,
      name: "King Chris",
      cover: "/musik/King_Chris/Front_Cover.jpg",
      status: "Verfügbar",
      route: "projectKingChris"
    },
    // weitere Projekte folgen...
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-32 md:w-48 bg-gray-800/80 border-r border-gray-700 p-2 md:p-4 flex flex-col gap-2 md:gap-3 sticky top-0 h-screen overflow-y-auto">
        <button
          onClick={() => setCurrentPage('artistProfile')}
          className="w-full px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-xs"
        >
          ← {t.backButton}
        </button>
        
        <div className="border-t border-gray-700 pt-2 md:pt-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full px-3 py-1.5 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-xs"
          >
            🏠 {t.homeButtonText || 'Home'}
          </button>
        </div>
      </div>

      {/* Main Content - Zentriert */}
      <div className="flex-1 p-2 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Titel */}
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            {t.projectsTitle}
          </h1>

          {/* Grid mit 2 Spalten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {projects.map((project, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPage(project.route)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="rounded-lg overflow-hidden shadow-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 transition-all duration-200">
                  {/* Cover Bild */}
                  <div className="aspect-square overflow-hidden bg-gray-900">
                    <img 
                      src={`${process.env.PUBLIC_URL}${project.cover}`} 
                      alt={`${project.name} Cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Projekt Info */}
                  <div className="p-3">
                    <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-blue-300 transition-all duration-200 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2">{project.status}</p>
                    <button className="w-full px-3 py-1.5 rounded bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 text-blue-300 hover:text-blue-200 transition-all duration-200 text-xs">
                      ▶ Öffnen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infos */}
          <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-3 md:p-4">
            <p className="text-gray-300 text-xs md:text-sm">
              <span className="text-blue-300 font-semibold">💡 Hinweis:</span> Die Projektliste wird in Kürze mit echten Alben gefüllt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
