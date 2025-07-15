import React, { useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { debugAdminRegistration } from "../firebase-test";
import { sendAdminRequestEmail } from "../utils/emailService";

export default function AdminRegistrationPage({ t, setCurrentPage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clanRole: "",
    reason: "",
    password: "",
    confirmPassword: "",
    requestedRole: "contentAdmin"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const handleDebugTest = async () => {
    setDebugInfo("Testing Firebase connection...");
    const result = await debugAdminRegistration();
    setDebugInfo(JSON.stringify(result, null, 2));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validierung
    if (!formData.name || !formData.email || !formData.clanRole || !formData.reason || !formData.password) {
      setError("Bitte fülle alle Felder aus!");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein!");
      setLoading(false);
      return;
    }

    // Email-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein!");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting admin registration process...");
      
      // Prüfe, ob es bereits Admins gibt
      console.log("Checking for existing admins...");
      const adminsSnapshot = await getDocs(collection(db, "admins"));
      const isFirstAdmin = adminsSnapshot.empty;
      
      console.log("Is first admin:", isFirstAdmin);
      console.log("Existing admins count:", adminsSnapshot.size);
      
      if (isFirstAdmin) {
        console.log("Creating first admin...");
        // Erster Admin wird automatisch genehmigt
        const adminDoc = await addDoc(collection(db, "admins"), {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'superAdmin', // Erster Admin ist immer Super Admin
          status: 'active',
          createdAt: new Date().toISOString(),
          requestedRole: 'superAdmin'
        });
        
        console.log("First admin created successfully:", adminDoc.id);
        setMessage("🎉 Herzlichen Glückwunsch! Du wurdest als erster Super Administrator registriert und kannst dich jetzt anmelden!");
      } else {
        console.log("Creating admin request...");
        // Normale Registrierungsanfrage
        const requestDoc = await addDoc(collection(db, "adminRequests"), {
          name: formData.name,
          email: formData.email,
          clanRole: formData.clanRole,
          reason: formData.reason,
          password: formData.password,
          status: "pending",
          requestDate: new Date().toISOString(),
          approvedBy: null,
          approvedDate: null,
          requestedRole: formData.requestedRole
        });
        
        console.log("Admin request created successfully:", requestDoc.id);
        
        // E-Mail-Benachrichtigung senden
        try {
          const emailResult = await sendAdminRequestEmail(formData);
          if (emailResult.success) {
            console.log("✅ E-Mail-Benachrichtigung erfolgreich gesendet:", emailResult);
            setMessage("Deine Registrierungsanfrage wurde erfolgreich gesendet! Du erhältst eine E-Mail, sobald sie vom Haupt-Administrator bearbeitet wurde. Eine Benachrichtigung wurde an den Administrator gesendet.");
          } else {
            console.warn("⚠️ E-Mail-Benachrichtigung fehlgeschlagen:", emailResult.error);
            setMessage("Deine Registrierungsanfrage wurde erfolgreich gesendet! Du erhältst eine E-Mail, sobald sie vom Haupt-Administrator bearbeitet wurde.");
          }
        } catch (emailError) {
          console.error("❌ E-Mail-Fehler:", emailError);
          setMessage("Deine Registrierungsanfrage wurde erfolgreich gesendet! Du erhältst eine E-Mail, sobald sie vom Haupt-Administrator bearbeitet wurde.");
        }
      }
      
      // Formular zurücksetzen
      setFormData({
        name: "",
        email: "",
        clanRole: "",
        reason: "",
        password: "",
        confirmPassword: "",
        requestedRole: "contentAdmin"
      });

    } catch (err) {
      console.error("Registration request error:", err);
      console.error("Error details:", err.message);
      
      // Detailliertere Fehlermeldungen
      if (err.code === 'permission-denied') {
        setError("Berechtigung verweigert. Bitte wende dich an den Administrator.");
      } else if (err.code === 'network-request-failed') {
        setError("Netzwerkfehler. Bitte überprüfe deine Internetverbindung.");
      } else if (err.code === 'unavailable') {
        setError("Firebase-Dienst nicht verfügbar. Bitte versuche es später erneut.");
      } else {
        setError(`Fehler beim Senden der Registrierungsanfrage: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
          Administrator-Registrierung
        </h2>
        
        <p className="text-gray-300 mb-6 text-center text-sm">
          Beantrage Zugang zum Admin-Bereich. Deine Anfrage wird vom Haupt-Administrator geprüft.
        </p>

        {message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <p className="text-green-300 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
            <h4 className="text-blue-300 text-sm font-semibold mb-2">Debug Info:</h4>
            <pre className="text-blue-200 text-xs overflow-auto max-h-32">{debugInfo}</pre>
          </div>
        )}

        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={handleDebugTest}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            Test Firebase-Verbindung
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vollständiger Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              placeholder="Dein vollständiger Name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail-Adresse *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              placeholder="deine@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rolle im Clan *
            </label>
            <select
              name="clanRole"
              value={formData.clanRole}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              disabled={loading}
            >
              <option value="">Bitte wählen...</option>
              <option value="Clanführer">Clanführer</option>
              <option value="Stellvertreter">Stellvertreter</option>
              <option value="Offizier">Offizier</option>
              <option value="Rechte Hand">Rechte Hand</option>
              <option value="Ältester">Ältester</option>
              <option value="Mitglied">Mitglied</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grund für Admin-Zugang *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none resize-none"
              placeholder="Erkläre, warum du Admin-Zugang benötigst..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gewünschte Berechtigung *
            </label>
            <select
              name="requestedRole"
              value={formData.requestedRole}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              disabled={loading}
            >
              <option value="contentAdmin">Content Admin - Spieler, Truhen, Ränge verwalten</option>
              <option value="viewer">Viewer - Nur Einsicht in Daten</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Super Admin Rechte können nur vom Haupt-Administrator vergeben werden.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passwort *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              placeholder="Mindestens 6 Zeichen"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passwort bestätigen *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
              placeholder="Passwort wiederholen"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 transform hover:scale-105"
            }`}
          >
            {loading ? "Sende Anfrage..." : "Registrierungsanfrage senden"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
            className="text-green-400 hover:text-green-300 text-sm underline"
          >
            Zurück zur Navigation
          </button>
        </div>
      </div>
      
      <footer className="mt-8 text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}
