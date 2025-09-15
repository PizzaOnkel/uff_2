import React, { useRef, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
function MusikShop_We_Stand_Together_Page({ t, setCurrentPage }) {
  // Daten für "We Stand Together"
  const base = process.env.PUBLIC_URL || "";
  const album = {
    title: "We Stand Together - Complete Live Concert Album",
    cover: `${base}/musik/We_Stand_Together/Image_2025-08-17.png`,
    price: "14,99 €",
    downloadUrl: `${base}/musik/Album_Complete.zip`,
    description: "Vollständiges LiveKonzert inklusive Bonustracks."
  };
  const tracks = [
    {
      id: 1,
      title: "Track 1",
      previewUrl: `${base}/musik/We_Stand_Together/Track_0.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_0.mp3`,
    },
    {
      id: 2,
      title: "Track 2",
      previewUrl: `${base}/musik/We_Stand_Together/Track_1.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_1.mp3`,
    },
    {
      id: 3,
      title: "Track 3",
      previewUrl: `${base}/musik/We_Stand_Together/Track_2.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_2.mp3`,
    },
    {
      id: 4,
      title: "Track 4",
      previewUrl: `${base}/musik/We_Stand_Together/Track_3.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_3.mp3`,
    },
    {
      id: 5,
      title: "Track 5",
      previewUrl: `${base}/musik/We_Stand_Together/Track_4.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_4.mp3`,
    },
    {
      id: 6,
      title: "Track 6",
      previewUrl: `${base}/musik/We_Stand_Together/Track_5.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_5.mp3`,
    },
    {
      id: 7,
      title: "Track 7",
      previewUrl: `${base}/musik/We_Stand_Together/Track_6.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_6.mp3`,
    },
    {
      id: 8,
      title: "Track 8",
      previewUrl: `${base}/musik/We_Stand_Together/Track_7.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_7.mp3`,
    },
    {
      id: 9,
      title: "Track 9",
      previewUrl: `${base}/musik/We_Stand_Together/Track_8.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_8.mp3`,
    },
    {
      id: 10,
      title: "Track 10",
      previewUrl: `${base}/musik/We_Stand_Together/Track_9.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_9.mp3`,
    },
    {
      id: 11,
      title: "Track 11",
      previewUrl: `${base}/musik/We_Stand_Together/Track_10.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_10.mp3`,
    },
    {
      id: 12,
      title: "Track 12",
      previewUrl: `${base}/musik/We_Stand_Together/Track_11.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_11.mp3`,
    },
    {
      id: 13,
      title: "Track 13",
      previewUrl: `${base}/musik/We_Stand_Together/Track_12.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_12.mp3`,
    },
    {
      id: 14,
      title: "Track 14",
      previewUrl: `${base}/musik/We_Stand_Together/Track_13.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_13.mp3`,
    },
    {
      id: 15,
      title: "Track 15",
      previewUrl: `${base}/musik/We_Stand_Together/Track_14.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_14.mp3`,
    },
    {
      id: 16,
      title: "Track 16",
      previewUrl: `${base}/musik/We_Stand_Together/Track_15.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_15.mp3`,
    },
    {
      id: 17,
      title: "Track 17",
      previewUrl: `${base}/musik/We_Stand_Together/Track_16.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_16.mp3`,
    },
    {
      id: 18,
      title: "Track 18",
      previewUrl: `${base}/musik/We_Stand_Together/Track_17.mp3`,
      price: "0,99 €",
      downloadUrl: `${base}/musik/We_Stand_Together/Track_17.mp3`,
    },
  ];

  const audioRefs = useRef([]);
  const [albumPaid, setAlbumPaid] = useState(false);
  const [trackPaid, setTrackPaid] = useState(Array(tracks.length).fill(false));
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
    <PayPalScriptProvider options={{ "client-id": "AacXr8FePzoU735adTnZEwWD_drzh36RCbdo02GFWHF5MQ2eyuwN_MoFZTHgZFXRWwdLS_ksrY5Cs9z7", currency: "EUR" }}>
      <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32 relative">
        <button
          onClick={() => setCurrentPage && setCurrentPage("musikShop")}
          className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded shadow-lg"
        >
          {t?.backButton || "Zurück"}
        </button>
        <div className="w-full flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">{album.title}</h1>
          <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
            <div className="flex items-center mb-6 w-full justify-center">
              <div className="w-40 h-40 bg-gray-700 flex items-center justify-center mr-6 rounded shadow overflow-hidden">
                <img src={album.cover} alt="Albumcover" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-lg mb-1">{album.title}</p>
                <p className="text-blue-300 mb-2">{album.description}</p>
                <p className="text-blue-300 mb-2">Preis: {album.price}</p>
                {!albumPaid ? (
                  <div className="mb-2">
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: { value: "14.99" },
                            description: album.title
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
                  <a href={album.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mb-2 shadow-lg inline-block">
                    Album Download
                  </a>
                )}
              </div>
            </div>
            <div className="mb-4 flex justify-center">
              <a href="/musik/We_Stand_Together/Album_Info.pdf" target="_blank" rel="noopener noreferrer"
                 className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow inline-block">
                CD & Track Infos (PDF)
              </a>
            </div>
            <table className="w-full text-center mb-6 bg-gray-900 rounded shadow-lg border border-gray-700">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2">#</th>
                  <th className="p-2">Titel</th>
                  <th className="p-2">Preis</th>
                  <th className="p-2">Vorschau</th>
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
                        Vorschau
                      </button>
                      <audio ref={(el) => (audioRefs.current[idx] = el)} src={track.previewUrl} preload="none" />
                    </td>
                    <td className="p-2 text-center">
                      {!trackPaid[idx] ? (
                        <PayPalButtons
                          style={{ layout: "vertical", height: 35 }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [{
                                amount: { value: "0.99" },
                                description: track.title
                              }]
                            });
                          }}
                          onApprove={(data, actions) => {
                            return actions.order.capture().then(() => {
                              setTrackPaid((prev) => {
                                const updated = [...prev];
                                updated[idx] = true;
                                return updated;
                              });
                            });
                          }}
                        />
                      ) : (
                        <a href={track.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded shadow inline-block">
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <footer className="mt-auto text-gray-500 text-sm">© PizzaOnkel Musik-Shop</footer>
      </div>
    </PayPalScriptProvider>
  );
}

export default MusikShop_We_Stand_Together_Page;
