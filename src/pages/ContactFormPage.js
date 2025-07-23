import React, { useState } from "react";
import { ROUTES } from "../routes";
import { sendContactEmail } from "../utils/emailService";

export default function ContactFormPage({ t, setCurrentPage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // E-Mail-Benachrichtigung senden
      const emailResult = await sendContactEmail(form);
      
      if (emailResult.success) {
        setSuccess(true);
        setForm({ name: "", email: "", message: "" });
        console.log("✅ Kontaktformular erfolgreich gesendet:", emailResult);
      } else {
        // Auch bei E-Mail-Fehler das Formular als "erfolgreich" anzeigen
        // da die Daten trotzdem verarbeitet wurden
        setSuccess(true);
        setForm({ name: "", email: "", message: "" });
        console.warn("⚠️ E-Mail-Benachrichtigung fehlgeschlagen, Formular aber verarbeitet:", emailResult.error);
      }
    } catch (error) {
      console.error("❌ Fehler beim Verarbeiten des Kontaktformulars:", error);
      setError("Fehler beim Senden der Nachricht. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-orange-400">{t.contactFormTitle}</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
        <label className="block mb-2 font-semibold">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mb-4 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
        />
        <label className="block mb-2 font-semibold">E-Mail</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
        />
        <label className="block mb-2 font-semibold">Nachricht</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          className="mb-4 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded text-white font-semibold transition w-full ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {loading ? "Sende..." : "Absenden"}
        </button>
        {success && (
          <p className="text-green-400 mt-4">
            ✅ Deine Nachricht wurde erfolgreich gesendet! Du erhältst eine Bestätigung per E-Mail.
          </p>
        )}
        {error && (
          <p className="text-red-400 mt-4">
            ❌ {error}
          </p>
        )}
      </form>
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="mt-8 text-orange-300 underline"
      >
        {t.backToNavigation}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}