"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Navbar from "@/components/ui/navbar";

const TOGETHER_API_KEY = process.env.NEXT_PUBLIC_TOGETHER_API_KEY;

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("Montrer mon expertise");
  const [tone, setTone] = useState("Professionnel & posé");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // ==================== PROTECTION CONNEXION ====================
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // ==================== PROTECTION ABONNEMENT + STRIPE ====================
  useEffect(() => {
    if (!user || authLoading || ready) return;

    const checkSubscription = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const status = userDoc.exists() ? userDoc.data().subscriptionStatus : null;

        console.log("🔍 Statut sur /generate →", status);

        if (status !== "premium_active") {
          console.log("🔄 [API] Création session Stripe");
          const res = await fetch("/api/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });

          if (!res.ok) {
            const text = await res.text();
            console.error("❌ Stripe error :", text || `HTTP ${res.status}`);
            setError("Impossible de créer la session Stripe. Réessaie plus tard.");
            setReady(true);
            return;
          }

          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          }
        }

        // Utilisateur premium → on autorise l'affichage de la page
        setReady(true);
      } catch (err: any) {
        console.error("Erreur lors de la vérification abonnement :", err);
        setError("Erreur de connexion Stripe. Réessaie.");
        setReady(true);
      }
    };

    checkSubscription();
  }, [user, authLoading, ready, router]);

  // ==================== GÉNÉRATION DES POSTS ====================
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) return;

    setLoading(true);
    setError("");
    setPosts([]);
    setSuccess(false);

    try {
      const prompt = `Tu es un expert LinkedIn. Réponds UNIQUEMENT avec un JSON valide.
{
  "posts": [
    {
      "day": 1,
      "hook": "Hook puissant",
      "content": "Texte complet du post (maximum 3 paragraphes)",
      "visual": "Description précise pour image"
    }
  ]
}
Niche : ${niche}
Objectif : ${goal}
Ton : ${tone}
Génère exactement 2 posts premium, différents et impactants.`;

      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      const data = await response.json();
      const rawText = data.choices[0].message.content;

      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}") + 1;
      const jsonStr = rawText.substring(start, end);
      const parsed = JSON.parse(jsonStr);
      let generatedPosts = parsed.posts || [];

      // Génération des images avec Grok-Imagine
      for (let i = 0; i < generatedPosts.length; i++) {
        const imgPrompt = `${generatedPosts[i].visual}. Style LinkedIn carousel premium, design moderne, couleurs élégantes, texte clair et impactant, fond sombre ou dégradé, très professionnel, haute qualité.`;

        const imgRes = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "xai/grok-imagine-image-pro",
            prompt: imgPrompt,
            width: 1200,
            height: 628,
            steps: 30,
          }),
        });

        const imgData = await imgRes.json();
        const base64 = imgData.data[0].b64_json;

        const blob = await fetch(`data:image/png;base64,${base64}`).then(r => r.blob());
        const storageRef = ref(storage, `posts/${user!.uid}/${Date.now()}-post${i}.png`);
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        generatedPosts[i].imageUrl = imageUrl;
      }

      setPosts(generatedPosts);

      // Sauvegarde dans Firestore
      await setDoc(doc(collection(db, "generations")), {
        userId: user!.uid,
        niche,
        goal,
        tone,
        posts: generatedPosts,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (post: any) => {
    navigator.clipboard.writeText(`${post.hook}\n\n${post.content}`);
  };

  // ==================== RENDU ====================
  if (authLoading || !ready) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold tracking-tighter mb-2">Générer ma semaine</h1>
        <p className="text-zinc-400 text-xl mb-10">Crée 2 posts LinkedIn premium en un clic</p>

        <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Ton métier / niche</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ex: IT Support, Transport de luxe..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Objectif principal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-400"
              >
                <option value="Montrer mon expertise">Montrer mon expertise</option>
                <option value="Gagner des clients">Gagner des clients</option>
                <option value="Recruter">Recruter</option>
                <option value="Développer mon réseau">Développer mon réseau</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Ton de voix</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-400"
              >
                <option value="Professionnel & posé">Professionnel & posé</option>
                <option value="Inspirant">Inspirant</option>
                <option value="Direct & impactant">Direct & impactant</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-70 transition-all py-5 rounded-3xl text-xl font-semibold"
          >
            {loading ? "Génération en cours..." : "🚀 Générer mes 2 posts LinkedIn Carousel"}
          </button>
        </form>

        {error && <p className="text-red-400 text-center mt-6">{error}</p>}
        {success && <p className="text-green-400 text-center mt-6">✅ Sauvegardé dans ton historique !</p>}

        {posts.length > 0 && (
          <div className="mt-16 space-y-12">
            {posts.map((post, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
                <div className="flex justify-between mb-6">
                  <div className="text-violet-400 font-medium text-lg">Post {i + 1}</div>
                  <button onClick={() => copyPost(post)} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm">📋 Copier</button>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{post.hook}</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-8">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Visual" className="w-full rounded-2xl border border-zinc-700 shadow-2xl" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}