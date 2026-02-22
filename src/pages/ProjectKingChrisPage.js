import React, { useRef, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function ProjectKingChrisPage({ t, setCurrentPage }) {
  const audioRefs = useRef({});
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [albumPaid, setAlbumPaid] = useState(false);
  const [trackPaid, setTrackPaid] = useState({});
  const albumInfo = {
    title: t.kingChrisTitle || "King Chris",
    subtitle: t.kingChrisSubtitle || "Rise of a Champion",
    releaseYear: t.kingChrisYear || "2025",
    tracks: [
      { id: 1, name: "intro - Instrumental" },
      { id: 2, name: "Intro - Frontman Opening" },
      { id: 3, name: "The Outsider" },
      { id: 4, name: "Creaming Of Glory" },
      { id: 5, name: "First Steps" },
      { id: 6, name: "Falling And Rising" },
      { id: 7, name: "Fight For Respect" },
      { id: 8, name: "Rising Star" },
      { id: 9, name: "The Call" },
      { id: 10, name: "30 Days" },
      { id: 11, name: "The Eve" },
      { id: 12, name: "Enter The Ring" },
      { id: 13, name: "Rise Of The Champion" },
      { id: 14, name: "Champoins Glory" },
      { id: 15, name: "Blende Outro" },
      { id: 16, name: "One More Time" },
      { id: 17, name: "Instumental Outro" },
      { id: 18, name: "King Chris - Bonus" },
    ]
  };

  const handlePreview = (trackId) => {
    if (playingTrackId === trackId) {
      // Stop playing
      if (audioRefs.current[trackId]) {
        audioRefs.current[trackId].pause();
      }
      setPlayingTrackId(null);
    } else {
      // Stop previous track
      if (playingTrackId !== null && audioRefs.current[playingTrackId]) {
        audioRefs.current[playingTrackId].pause();
      }
      // Play new track
      if (!audioRefs.current[trackId]) {
        const trackNum = String(trackId).padStart(2, '0');
        audioRefs.current[trackId] = new Audio(`${process.env.PUBLIC_URL}/musik/King_Chris/Track_${trackNum}.mp3`);
      }
      audioRefs.current[trackId].currentTime = 0;
      audioRefs.current[trackId].play();
      setPlayingTrackId(trackId);
      
      // Stop after 45 seconds
      setTimeout(() => {
        if (audioRefs.current[trackId] && playingTrackId === trackId) {
          audioRefs.current[trackId].pause();
          setPlayingTrackId(null);
        }
      }, 45000);
    }
  };

  const handleDownloadTrack = (trackId) => {
    const trackNum = String(trackId).padStart(2, '0');
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL}/musik/King_Chris/Track_${trackNum}.mp3`;
    link.download = `Track_${trackNum}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAlbum = () => {
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL}/musik/King_Chris/King_Cris.zip`;
    link.download = 'King_Cris.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PayPalScriptProvider options={{ 'client-id': 'AeTClJ5IRKPfgCeucTp2ly3RzV27VO0OSEpukrJxP6YbqUBRQuzFljO7_IqgdM79BIHsBilOeOx3TE1P', currency: 'EUR' }}>
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-32 md:w-48 bg-gray-800/80 border-r border-gray-700 p-2 md:p-4 flex flex-col justify-center items-center sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <button
            onClick={() => setCurrentPage('projects')}
            className="px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-xs"
          >
            ← Zurück
          </button>
          
          <button
            onClick={() => setCurrentPage('kingChrisStory')}
            className="px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-800 transition-all duration-200 text-purple-300 hover:text-purple-200 text-xs font-semibold"
          >
            📖 {t.toStoryButton || "Zur Story"}
          </button>
          
          <div className="border-t border-b border-gray-700 py-2 md:py-3 flex flex-col items-center gap-2 md:gap-3">
            <button
              onClick={() => setCurrentPage('artistProfile')}
              className="px-3 py-1.5 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-xs"
            >
              👤 Künstler
            </button>
            
            <button
              onClick={() => setCurrentPage('home')}
              className="px-3 py-1.5 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-xs"
            >
              🏠 Startseite
            </button>
          </div>

          {/* Album Download via PayPal */}
          <div className="border-t border-gray-700 pt-4 w-full">
            <p className="text-center text-xs text-gray-400 mb-3">Full-Album Download</p>
            {!albumPaid ? (
              <div style={{ maxWidth: '100%' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', height: 35, shape: 'pill', color: 'blue' }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: { value: '19.99' },
                        description: 'King Chris - Full Album'
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(() => {
                      setAlbumPaid(true);
                    });
                  }}
                />
              </div>
            ) : (
              <button
                onClick={handleDownloadAlbum}
                className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 border border-green-700 transition-all duration-200 text-white font-bold shadow-lg text-sm"
              >
                ⬇️ Album Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Zentriert */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Cover Bild - Vollständig anzeigen */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <img
              src={process.env.PUBLIC_URL + '/musik/King_Chris/Front_Cover.jpg'}
              alt="King Chris Album Cover"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Titel & Untertitel */}
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            {albumInfo.title}
          </h1>
          <p className="text-lg md:text-xl text-purple-300 mb-2">{albumInfo.subtitle}</p>
          <p className="text-gray-400 mb-8">📅 {albumInfo.releaseYear}</p>

          {/* Story Teaser */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 md:p-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-3 text-purple-300">📖 {t.storyTitle || "Die Story"}</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-200 mb-4">
              {t.storyTeaser || "Die inspirierende Geschichte von Chris, einem kleinen Jungen mit einem Stottern, der zu einer Box-Legende wurde. Von den Schikanen in der Schule bis zum Champion der Welt - eine Geschichte über Mut, Durchhaltevermögen und den Kampfgeist, der niemals aufgibt."}
            </p>
            <button
              onClick={() => setCurrentPage('kingChrisStory')}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 border border-purple-700 transition-all duration-200 text-white text-sm font-semibold shadow-lg"
            >
              📖 {t.readFullStory || "Lese die vollständige Story"}
            </button>
          </div>

          {/* Track List */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 md:p-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-blue-300">🎵 Tracks</h2>
            <div className="space-y-2">
              {albumInfo.tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 md:p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-mono">{String(track.id).padStart(2, '0')}</span>
                    <span className="text-gray-200 font-semibold">{track.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreview(track.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                        playingTrackId === track.id
                          ? 'bg-green-900/50 border border-green-600 text-green-300'
                          : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 text-gray-300 hover:text-gray-200'
                      }`}
                    >
                      {playingTrackId === track.id ? '⏸ Stop' : '▶ Preview'}
                    </button>
                    
                    {/* PayPal Download Button */}
                    {!trackPaid[track.id] ? (
                      <div style={{ minWidth: '140px' }}>
                        <PayPalButtons
                          style={{ layout: 'vertical', height: 28 }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [{
                                amount: { value: '1.49' },
                                description: track.name
                              }]
                            });
                          }}
                          onApprove={(data, actions) => {
                            return actions.order.capture().then(() => {
                              setTrackPaid((prev) => ({
                                ...prev,
                                [track.id]: true
                              }));
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadTrack(track.id)}
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-bold whitespace-nowrap"
                      >
                        ⬇️ Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Album Info PDF */}
          <div className="mb-8 flex justify-center">
            <a 
              href={`${process.env.PUBLIC_URL}/musik/King_Chris/Album_Info.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border border-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              📄 Album Info & Credits (PDF)
            </a>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <p className="text-gray-300 text-center">
              <span className="text-blue-300 font-semibold">👑</span> King Chris Album
            </p>
          </div>
        </div>
      </div>
    </div>
    </PayPalScriptProvider>
  );
}
