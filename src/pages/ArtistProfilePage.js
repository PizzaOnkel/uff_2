import React from 'react';

export default function ArtistProfilePage({ t, language, setCurrentPage }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-32 md:w-48 bg-gray-800/80 border-r border-gray-700 p-2 md:p-4 flex flex-col gap-2 md:gap-3 sticky top-0 h-screen overflow-y-auto">
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-xs"
        >
          ← {t.backButton}
        </button>
        
        <div className="border-t border-gray-700 pt-2 md:pt-3">
          <button
            onClick={() => setCurrentPage('projects')}
            className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-white text-xs md:text-sm font-semibold shadow-lg hover:shadow-xl"
          >
            🎵 {t.projectsButtonText}
          </button>
        </div>
      </div>

      {/* Main Content - Zentriert */}
      <div className="flex-1 p-2 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Bild */}
          <div className="mb-6 rounded-lg overflow-hidden shadow-2xl">
            <img
              src={process.env.PUBLIC_URL + '/artist_picture/band_picture.png'}
              alt="P.O. & Friends Band"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>

          {/* Titel und Untertitel */}
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            P.O. & Friends
          </h1>
          <p className="text-lg md:text-xl text-purple-300 mb-6">Raw Stories. Real Life. Arena Sound.</p>

          {/* Bio-Text */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 md:p-4 mb-6">
            <p className="text-sm md:text-base leading-relaxed text-gray-200 whitespace-pre-wrap">
              {t.artistBio}
            </p>
          </div>

          {/* Crew Informationen */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 md:p-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-blue-300 mb-3">{t.artistCrewTitle}</h2>
            <div className="text-gray-200 text-sm md:text-base whitespace-pre-line mb-3">
              {t.artistMembers.split('\n').map((member, idx) => (
                <div key={idx} className="flex items-start mb-2">
                  <span className="text-purple-400 mr-3">♪</span>
                  <span>{member}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-300 mt-4 text-sm">{t.artistGuests}</p>
          </div>

          {/* Copyright */}
          <div className="text-center pb-8">
            <p className="text-gray-500 text-sm">{t.artistCopyright}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
