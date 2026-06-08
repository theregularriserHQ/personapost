"use client";

interface Post {
  day: number;
  hook: string;
  content: string;
  imageUrl?: string;
}

interface Generation {
  id: string;
  createdAt: any;
  niche: string;
  goal: string;
  tone: string;
  posts: Post[];
}

interface HistoryModalProps {
  generation: Generation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ generation, isOpen, onClose }: HistoryModalProps) {
  if (!isOpen || !generation) return null;

  const posts = generation.posts || [];

  const copyPost = (post: Post) => {
    const text = `${post.hook}\n\n${post.content}`;
    navigator.clipboard.writeText(text);
    alert("Post copié !");
  };

  const copyAll = () => {
    if (posts.length === 0) {
      alert("Aucun post à copier.");
      return;
    }
    const allText = posts.map(p => `Jour ${p.day}\n${p.hook}\n\n${p.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    alert("Tous les posts ont été copiés !");
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-semibold">Génération du {generation.createdAt?.toDate ? new Date(generation.createdAt.toDate()).toLocaleDateString('fr-FR') : ""}</h2>
            <p className="text-zinc-400 text-sm mt-1">{generation.niche} • {generation.goal}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-3xl">×</button>
        </div>

        <div className="p-8">
          {posts.length === 0 ? (
            <p className="text-center text-zinc-400 py-10">Aucun post trouvé dans cette génération.</p>
          ) : (
            <div className="space-y-10">
              {posts.map((post, index) => (
                <div key={index} className="border border-zinc-700 rounded-2xl p-7">
                  <div className="flex justify-between mb-4">
                    <div className="text-violet-400 font-medium">Jour {post.day}</div>
                    <button onClick={() => copyPost(post)} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl">Copier</button>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{post.hook}</h3>
                  <p className="text-zinc-300 whitespace-pre-wrap mb-6">{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt={`Jour ${post.day}`} className="rounded-2xl border border-zinc-700 w-full" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-6 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={copyAll} className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl">Copier tout</button>
          <button onClick={onClose} className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-2xl text-white">Fermer</button>
        </div>
      </div>
    </div>
  );
}
