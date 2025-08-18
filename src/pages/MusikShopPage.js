import React, { useRef } from "react";
// import { ROUTES } from "../routes";
// import StickyBackButton from "../components/StickyBackButton";
// import { loadStripe } from "@stripe/stripe-js";


// Stripe initialisieren (Public Key aus Stripe Dashboard!)
// const stripePromise = loadStripe("pk_test_1234567890"); // <-- DEIN PUBLIC KEY HIER

// Basis-URL für GitHub Pages Deployment (mit abschließendem "/")
const baseUrl = "/musik/";

// Tracks mit Preisen und Dateipfaden (korrekte Zuordnung: Track 1 = Track_0.mp3 ... Track 18 = Track_17.mp3)
const tracks = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  title: `Track ${i + 1}`,
  previewUrl: `${baseUrl}Track_${i}.mp3`,
  price: "0,99 €",
  downloadUrl: `${baseUrl}Track_${i}.mp3`,
})); // Sortiert von 1 bis 18

const album = {
  title: "Complete Live Concert Album",
  cover: `${baseUrl}Image_2025-08-17.png`,
  price: "14,99 €",
  downloadUrl: `${baseUrl}Album_Complete.zip`,
  description: "Vollständiges LiveKonzert inklusive Bonustracks."
};

function MusikShopPage() {
  const audioRefs = useRef([]);

  const handlePreview = (idx) => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.onloadedmetadata = () => {
        const maxStart = Math.max(0, audio.duration - 60);
        audio.currentTime = Math.random() * maxStart;
        audio.play();
        setTimeout(() => {
          audio.pause();
        }, 60000); // 60 Sekunden Vorschau
      };
      audio.load();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32 relative">
      {/* Statischer Zurück-Button */}
      <button onClick={() => window.history.back()} className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded shadow-lg">
        Zurück
      </button>

      <div className="w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Musik-Shop</h1>

        <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
          <p className="mb-4 text-lg text-blue-200 text-center">
            Willkommen an alle Fans echter 80er Rockmusik!<br /><br />
            Damit dieses Projekt erhalten werden kann, ist es notwendig, dass wir Einnahmen generieren.<br />
            Da ich (PizzaOnkel) nicht viel von Spenden halte, bekommt jeder Spieler die Möglichkeit, KI-generierte Musik zu kaufen.<br />
            Hier ein kurzer Überblick über meine Tracks und das Album. Das Probehören spielt zufällig ausgewählte Sequenzen der Tracks für 60 Sekunden ab.
          </p>

          <div className="flex items-center mb-6 w-full justify-center">
            <div className="w-40 h-40 bg-gray-700 flex items-center justify-center mr-6 rounded shadow overflow-hidden">
              <img src={album.cover} alt="Albumcover" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-lg mb-1">{album.title}</p>
              <p className="text-blue-300 mb-2">{album.description}</p>
              <p className="text-blue-300 mb-2">Preis: {album.price}</p>
              <a href={album.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mb-2 shadow-lg inline-block">
                Album kaufen / Download
              </a>
            </div>
          </div>

          <table className="w-full text-center mb-6 bg-gray-900 rounded shadow-lg border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">#</th>
                <th className="p-2">Titel</th>
                <th className="p-2">Preis</th>
                <th className="p-2">Probehören</th>
                <th className="p-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, idx) => (
                <tr key={track.id} className="hover:bg-gray-800">
                  <td className="p-2 text-center">{track.id}</td>
                  <td className="p-2">{track.title}</td>
                  <td className="p-2 text-center">{track.price}</td>
                  <td className="p-2 text-center">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded shadow" onClick={() => handlePreview(idx)}>
                      Probehören (60 Sekunden)
                    </button>
                    <audio ref={(el) => (audioRefs.current[idx] = el)} src={track.previewUrl} preload="none" />
                  </td>
                  <td className="p-2 text-center">
                    <a href={track.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded shadow inline-block">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">© PizzaOnkel Musik-Shop</footer>
    </div>
  );
}

export default MusikShopPage;
