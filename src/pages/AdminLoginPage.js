import React, { useState } from "react";
import { ROUTES } from "../routes";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLoginPage({ t, setCurrentPage, setIsAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(true);
      setCurrentPage(ROUTES.ADMIN_PANEL);
    } catch (err) {
      setError("Falsche Zugangsdaten!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">{t.adminPanelTitle}</h2>
      <form onSubmit={handleLogin} className="flex flex-col items-center">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Admin-E-Mail"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Admin-Passwort"
          className="mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </form>
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="mt-8 text-blue-300 underline"
      >
        {t.backToNavigation}
      </button>
    </div>
  );
}