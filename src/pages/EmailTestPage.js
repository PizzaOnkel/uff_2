import React, { useState } from "react";
import { testEmailConfiguration } from "../utils/emailService";

export default function EmailTestPage({ t, setCurrentPage }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const emailResult = await testEmailConfiguration();
      setResult(emailResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
          E-Mail-Konfiguration testen
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">
            Diese Seite hilft dir dabei, die E-Mail-Konfiguration zu testen. 
            Stelle sicher, dass du die Werte in <code>emailConfig.js</code> korrekt eingegeben hast.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-400 mb-2">Erforderliche Schritte:</h3>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. EmailJS-Account erstellen (emailjs.com)</li>
              <li>2. Service einrichten (Gmail, Outlook, etc.)</li>
              <li>3. Templates erstellen</li>
              <li>4. Konfiguration in emailConfig.js eintragen</li>
            </ol>
          </div>
        </div>

        <button
          onClick={handleTestEmail}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Sende Test-E-Mail..." : "Test-E-Mail senden"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-900/30 border border-green-600' 
              : 'bg-red-900/30 border border-red-600'
          }`}>
            <p className={`text-sm ${
              result.success ? 'text-green-300' : 'text-red-300'
            }`}>
              {result.success ? '✅ ' : '❌ '} 
              {result.message || result.error}
            </p>
          </div>
        )}

        <button
          onClick={() => setCurrentPage('navigation')}
          className="mt-6 w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
        >
          Zurück zur Navigation
        </button>
      </div>
    </div>
  );
}
