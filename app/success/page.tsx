"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/navbar";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const id = searchParams.get("session_id");
    setSessionId(id);

    if (id) {
      // Tu peux ici vérifier le statut du paiement via une API route si tu veux
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin h-12 w-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-xl">Vérification de ton paiement...</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold mb-4">Paiement réussi !</h1>
            <p className="text-zinc-400 mb-8">
              Bienvenue dans l’essai gratuit de 7 jours.<br />
              Tu peux maintenant générer tes posts LinkedIn.
            </p>

            <Link 
              href="/generate" 
              className="inline-block bg-violet-600 hover:bg-violet-700 transition px-8 py-4 rounded-2xl text-lg font-semibold"
            >
              Commencer à générer mes posts →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-3xl font-bold mb-4">Oups...</h1>
            <p className="text-zinc-400 mb-8">
              Impossible de vérifier ton paiement.<br />
              Merci de réessayer ou de contacter le support.
            </p>
            <Link href="/generate" className="text-violet-400 hover:underline">
              Retourner à la génération
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
          Chargement...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </>
  );
}