import React from "react";
import MusikShopPage from "./MusikShopPage";

export default function MusikShop_PO_Friends_Goes_Country_Page(props) {
  // Platzhalter für Shop-Inhalte
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">PO Friends Goes Country</h1>
      <p className="mb-4">Shop-Inhalte folgen demnächst.</p>
      <button onClick={() => props.setCurrentPage && props.setCurrentPage("musikShop")} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded shadow-lg">Zurück zur Übersicht</button>
    </div>
  );
}
