"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import HistoryModal from "@/components/HistoryModal";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "generations"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGenerations(data);
      } catch (error) {
        console.error("Erreur chargement historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, authLoading, router]);

  const openModal = (gen: any) => {
    setSelectedGeneration(gen);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGeneration(null);
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm("Supprimer cette génération ?")) return;
    await deleteDoc(doc(db, "generations", id));
    setGenerations(generations.filter(g => g.id !== id));
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Chargement de l’historique...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-5xl font-bold tracking-tighter mb-2">Historique des générations</h1>
        <p className="text-zinc-400 text-xl mb-10">Tous tes posts LinkedIn générés</p>

        {generations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <p className="text-zinc-400 text-lg">Aucune génération pour le moment.</p>
            <a href="/generate" className="mt-6 inline-block text-violet-400 hover:underline text-lg">Créer ma première semaine →</a>
          </div>
        ) : (
          <div className="space-y-6">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-violet-400 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all cursor-pointer"
                onClick={() => openModal(gen)}
              >
                <div className="flex-1">
                  <div className="text-xs text-zinc-500">
                    {gen.createdAt?.toDate 
                      ? new Date(gen.createdAt.toDate()).toLocaleDateString('fr-FR', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }) 
                      : "Date inconnue"}
                  </div>
                  <div className="text-2xl font-semibold mt-2">{gen.niche}</div>
                  <div className="text-zinc-400 text-sm mt-1">{gen.goal} • {gen.tone}</div>
                  <div className="text-xs text-violet-400 mt-4">{gen.posts?.length || 0} posts générés</div>
                </div>

                <div className="flex gap-3 self-end md:self-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(gen); }}
                    className="bg-zinc-800 hover:bg-zinc-700 px-8 py-4 rounded-2xl text-sm font-medium"
                  >
                    Voir les posts
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteGeneration(gen.id); }}
                    className="text-red-400 hover:text-red-500 px-6 py-4 rounded-2xl text-sm"
                  >
                    Supprimer
                  </button>
                </div>
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