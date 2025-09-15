import React from "react";

export default function MusikShop_Love_Beyond_The_Silence_Page(props) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Love Beyond The Silence</h1>
      <p className="mb-4">Shop-Inhalte folgen demnächst.</p>
      <button onClick={() => props.setCurrentPage && props.setCurrentPage("musikShop")} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded shadow-lg">Zurück zur Übersicht</button>
    </div>
  );
}
