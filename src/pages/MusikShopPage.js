import React, { useRef } from "react";
// import { ROUTES } from "../routes";
// import StickyBackButton from "../components/StickyBackButton";
// import { loadStripe } from "@stripe/stripe-js";


// Stripe initialisieren (Public Key aus Stripe Dashboard!)
// const stripePromise = loadStripe("pk_test_1234567890"); // <-- DEIN PUBLIC KEY HIER

// Absolute Basis-URL für GitHub Pages Deployment (angepasst auf dein Repo)
const base = process.env.PUBLIC_URL || "";
const baseUrl = `${base}/musik/`;

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
  cover: "/musik/We_Stand_Together/Image_2025-08-17.png", // absolut für Online
  price: "14,99 €",
  downloadUrl: "/musik/We_Stand_Together/Album_Complete.zip", // absolut für Online
  description: "Vollständiges LiveKonzert inklusive Bonustracks."
};

function MusikShopPage(props) {
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
      <button onClick={() => window.history.back()} className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded shadow-lg">
        Zurück
      </button>
      <div className="w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Musik-Shop Übersicht</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-8">
          {/* Platzhalter 1: We Stand Together */}
          <div className="bg-gray-800 rounded p-6 flex flex-col items-center shadow-lg">
            <img src={`${base}/musik/We_Stand_Together/Image_2025-08-17.png`} alt="We Stand Together" className="w-32 h-32 object-cover mb-4 rounded" />
            <h2 className="text-xl font-bold mb-2 text-blue-300">We Stand Together</h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow" onClick={() => props.setCurrentPage && props.setCurrentPage("musikShopWeStandTogether")}>Zum Shop</button>
          </div>
          {/* Platzhalter 2: PO Friends Goes Country */}
          <div className="bg-gray-800 rounded p-6 flex flex-col items-center shadow-lg">
            <img src={`${base}/musik/PO_Friends_Goes_Country/cover.png`} alt="PO Friends Goes Country" className="w-32 h-32 object-cover mb-4 rounded" />
            <h2 className="text-xl font-bold mb-2 text-blue-300">PO Friends Goes Country</h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow" onClick={() => props.setCurrentPage && props.setCurrentPage("musikShopPOFriendsGoesCountry")}>Zum Shop</button>
          </div>
          {/* Platzhalter 3: Love Beyond The Silence */}
          <div className="bg-gray-800 rounded p-6 flex flex-col items-center shadow-lg">
            <img src={`${base}/musik/Love_Beyond_The_Silence/cover.png`} alt="Love Beyond The Silence" className="w-32 h-32 object-cover mb-4 rounded" />
            <h2 className="text-xl font-bold mb-2 text-blue-300">Love Beyond The Silence</h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow" onClick={() => props.setCurrentPage && props.setCurrentPage("musikShopLoveBeyondTheSilence")}>Zum Shop</button>
          </div>
          {/* Platzhalter 4: King Chris */}
          <div className="bg-gray-800 rounded p-6 flex flex-col items-center shadow-lg">
          <img src={`${base}/musik/King_Chris/King_Chris_Front_Cover.jpg`} alt="King Chris" className="w-32 h-32 object-cover mb-4 rounded" />
            <h2 className="text-xl font-bold mb-2 text-blue-300">King Chris</h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow" onClick={() => props.setCurrentPage && props.setCurrentPage("musikShopKingChris")}>Zum Shop</button>
          </div>
        </div>
        <footer className="mt-auto text-gray-500 text-sm">© PizzaOnkel Musik-Shop</footer>
      </div>
    </div>
  );
}

export default MusikShopPage;
