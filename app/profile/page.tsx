"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDisplayName(data.displayName || user.displayName || user.email?.split("@")[0] || "");
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const saveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(doc(db, "users", user.uid), { displayName: displayName.trim() });
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = () => {
    if (confirm("Êtes-vous sûr de vouloir résilier votre abonnement ? Cette action est irréversible.")) {
      alert("Demande de résiliation envoyée. Nous vous contacterons par email.");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold tracking-tighter mb-2">Mon Profil</h1>
        <p className="text-zinc-400 text-xl mb-10">Gère ton compte PersonaPost</p>

        {/* Nom d'affichage */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Nom d’affichage</h2>
            {!editing ? (
              <button 
                onClick={() => setEditing(true)} 
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="text-zinc-400 hover:text-white text-sm">Annuler</button>
                <button 
                  onClick={saveDisplayName} 
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-2xl text-sm font-medium disabled:opacity-70"
                >
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-xl focus:outline-none focus:border-violet-400"
            />
          ) : (
            <div className="text-3xl font-semibold">{displayName || "Utilisateur"}</div>
          )}
        </div>

        {/* Abonnement Premium */}
        <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <h2 className="text-2xl font-semibold">Abonnement Premium</h2>
              <p className="text-emerald-400 text-sm">Actif</p>
            </div>
          </div>

          {/* Bouton Résilier sobre */}
          <div className="mt-12 pt-8 border-t border-zinc-700">
            <button
              onClick={handleCancelSubscription}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-zinc-500 text-zinc-300 hover:text-white py-5 rounded-3xl font-medium transition-all"
            >
              Résilier mon abonnement
            </button>
            <p className="text-xs text-zinc-500 text-center mt-4">
              Vous pourrez annuler à tout moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}