"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-3xl px-5 py-2 text-sm mb-8">
          <span className="text-orange-400">🔥</span>
          <span className="font-medium">7 jours d’essai gratuit</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
          Génère <span className="text-violet-400">7 posts LinkedIn</span><br />
          premium par semaine
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Plus besoin de passer des heures à créer du contenu.<br />
          Obtiens des posts professionnels + visuels en un clic.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="bg-violet-600 hover:bg-violet-700 transition-all px-10 py-5 rounded-3xl text-lg font-semibold w-full sm:w-auto"
          >
            Commencer mon essai gratuit de 7 jours
          </Link>

          <Link
            href="/login"
            className="border border-zinc-700 hover:border-zinc-400 transition-all px-10 py-5 rounded-3xl text-lg font-medium w-full sm:w-auto"
          >
            J’ai déjà un compte
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="border-t border-zinc-800 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-zinc-900 rounded-3xl p-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-lg mb-2">Gagne du temps</h3>
            <p className="text-zinc-400">7 posts prêts à publier chaque semaine</p>
          </div>
          <div className="bg-zinc-900 rounded-3xl p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Visibilité maximale</h3>
            <p className="text-zinc-400">Posts optimisés pour l’algorithme LinkedIn</p>
          </div>
          <div className="bg-zinc-900 rounded-3xl p-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-lg mb-2">Design premium</h3>
            <p className="text-zinc-400">Carrousels visuels inclus</p>
          </div>
        </div>
      </div>
    </div>
  );
}