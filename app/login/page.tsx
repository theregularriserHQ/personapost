"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(
        err.message.includes("auth/invalid-credential") 
          ? "Email ou mot de passe incorrect" 
          : "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Vérification de la session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2">Connexion</h1>
        <p className="text-zinc-400 text-center mb-8">Accède à ton espace PersonaPost</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
            required
          />

          {error && <p className="text-red-400 text-center bg-red-950/50 p-3 rounded-2xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl text-lg font-semibold disabled:opacity-70"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-6 text-zinc-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-violet-400 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
