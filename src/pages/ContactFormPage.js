import React, { useState } from "react";
import { ROUTES } from "../routes";

export default function ContactFormPage({ t, setCurrentPage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Hier könntest du später eine E-Mail senden oder die Nachricht speichern
    setSuccess(true);
    setForm({ name: "", email: "", message: "" });
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
          className="px-6 py-2 bg-orange-600 rounded text-white font-semibold hover:bg-orange-700 transition w-full"
        >
          Absenden
        </button>
        {success && (
          <p className="text-green-400 mt-4">Deine Nachricht wurde erfolgreich gesendet!</p>
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