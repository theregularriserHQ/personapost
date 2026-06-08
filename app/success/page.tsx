"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/ui/navbar";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !sessionId) {
      router.replace("/dashboard");
      return;
    }

    const activateTrial = async () => {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          subscriptionStatus: "premium_active",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        });

        setStatus("success");

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1600);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    activateTrial();
  }, [user, sessionId, router, authLoading]);

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-6 animate-spin">⏳</div>
          <p className="text-white text-xl">Activation de ton essai gratuit 7 jours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-3xl p-12 text-center">
          {status === "success" ? (
            <>
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-5xl mb-8">
                🎉
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Bienvenue dans PersonaPost !</h1>
              <p className="text-emerald-400 text-2xl mb-8">Ton essai gratuit de 7 jours est activé</p>
              <p className="text-zinc-400">Redirection vers le dashboard...</p>
            </>
          ) : (
            <p className="text-red-400">Erreur lors de l’activation. Reviens sur le dashboard.</p>
          )}
        </div>
      </div>
    </>
  );
}