
import React from "react";

/**
 * StickyBackButton-Komponente: Ein Button, der am oberen Rand klebt und für Navigation verwendet wird.
 * Props:
 * - onClick: Funktion, die beim Klicken ausgeführt wird
 * - label: Text auf dem Button
 */
export default function StickyBackButton({ onClick, label = "Zurück" }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200"
      style={{ minWidth: 100 }}
    >
      {/* Unicode-Arrow für Zurück */}
      <span style={{ marginRight: 8 }}>&larr;</span>
      {label}
    </button>
  );
}
