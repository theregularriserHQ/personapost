"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import HistoryModal from "@/components/HistoryModal";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  // Protection connexion
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  // Récupération du vrai statut abonnement
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchSubscription = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const status = userDoc.exists() ? userDoc.data().subscriptionStatus : null;
        console.log("🔍 Statut abonnement Dashboard →", status);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubscription();
  }, [user, authLoading]);

  // Chargement des générations
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "generations"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const generations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecentGenerations(generations.slice(0, 3));
        const total = generations.reduce((sum, gen) => sum + ((gen as any).posts?.length || 0), 0);
        setTotalPosts(total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchData();
  }, [user]);

  const openModal = (gen: any) => {
    setSelectedGeneration(gen);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGeneration(null);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Chargement...</div>;
  }

  const isPremium = subscriptionStatus === "premium_active";

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter">
              Bonjour, {user?.displayName || user?.email?.split("@")[0] || "Utilisateur"} 👋
            </h1>
            <p className="text-zinc-400 text-xl mt-2">Prêt à briller sur LinkedIn cette semaine ?</p>
          </div>
          <Link
            href="/generate"
            className="bg-violet-600 hover:bg-violet-700 transition-all px-8 py-4 rounded-3xl text-lg font-semibold flex items-center gap-3 shadow-lg shadow-violet-500/30"
          >
            🚀 Générer ma semaine
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="text-violet-400 text-sm font-medium">Posts générés</div>
            <div className="text-6xl font-bold mt-2">{totalPosts}</div>
            <div className="text-zinc-500 text-sm mt-1">au total</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="text-violet-400 text-sm font-medium">Générations</div>
            <div className="text-6xl font-bold mt-2">{recentGenerations.length}</div>
            <div className="text-zinc-500 text-sm mt-1">cette semaine</div>
          </div>

          {/* Statut dynamique */}
          <div className={`rounded-3xl p-8 relative overflow-hidden transition-all ${
            isPremium 
              ? "bg-zinc-900 border border-emerald-500/30" 
              : "bg-zinc-900 border border-amber-500/30"
          }`}>
            <div className="text-emerald-400 text-sm font-medium">Statut</div>
            
            {isPremium ? (
              <>
                <div className="text-3xl font-semibold mt-3">Premium Actif</div>
                <div className="text-emerald-400 text-xs mt-6 flex items-center gap-2">
                  <span className="text-lg">✅</span> Essai gratuit en cours
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-semibold mt-3 text-amber-400">Pas encore Premium</div>
                <div className="text-amber-400 text-xs mt-6">
                  Débloque tes générations LinkedIn
                </div>
                <Link
                  href="/generate"
                  className="mt-6 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-2xl text-sm"
                >
                  🚀 Commencer l’essai gratuit
                </Link>
              </>
            )}

            <div className="absolute -right-6 -top-6 text-[120px] font-black text-emerald-400/10">7</div>
          </div>
        </div>

        {/* Dernières générations */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dernières générations</h2>
          <Link href="/history" className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
            Voir tout <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {loadingHistory ? (
          <div className="text-center py-12 text-zinc-400">Chargement...</div>
        ) : recentGenerations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
            <p className="text-zinc-400">Aucune génération pour le moment.</p>
            <Link href="/generate" className="mt-6 inline-block text-violet-400 hover:underline">Créer ma première semaine →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recentGenerations.map((gen) => (
              <div
                key={gen.id}
                onClick={() => openModal(gen)}
                className="bg-zinc-900 border border-zinc-800 hover:border-violet-400 rounded-3xl p-6 cursor-pointer transition-all"
              >
                <div className="text-xs text-zinc-500">
                  {gen.createdAt?.toDate ? new Date(gen.createdAt.toDate()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
                </div>
                <div className="font-semibold text-xl mt-3 line-clamp-2">{gen.niche}</div>
                <div className="text-sm text-zinc-400 mt-2">{gen.posts?.length || 0} posts • {gen.tone}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HistoryModal
        generation={selectedGeneration}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}