"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Création du document utilisateur dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.email?.split("@")[0] || "",
        subscriptionStatus: "trial_pending",
        createdAt: new Date().toISOString(),
      });

      // Appel API Stripe avec l'email de l'utilisateur
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirection vers Stripe Checkout
      } else {
        throw new Error("Pas d'URL Stripe reçue");
      }
    } catch (err: any) {
      console.error("❌ Erreur complète :", err);
      setError(err.message || "Erreur inconnue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2">Créer mon compte</h1>
        <p className="text-emerald-400 text-center mb-8">Essai gratuit 7 jours</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            minLength={6}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-400"
            required
          />

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl text-lg font-semibold disabled:opacity-70 transition-all"
          >
            {loading ? "Création en cours..." : "Créer mon compte et commencer l'essai"}
          </button>
        </form>

        <p className="text-center mt-6 text-zinc-500">
          Déjà un compte ? <Link href="/login" className="text-violet-400 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
