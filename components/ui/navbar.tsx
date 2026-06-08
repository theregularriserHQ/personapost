"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={user ? "/dashboard" : "/"} 
            className="text-2xl font-bold tracking-tight text-white hover:text-violet-400 transition-colors"
          >
            PersonaPost
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/history" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Historique</Link>
                <Link href="/generate" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Générer</Link>
                
                <Link 
                  href="/profile"
                  className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {user.displayName || user.email?.split("@")[0] || "Utilisateur"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Se connecter</Link>
                <Link 
                  href="/register"
                  className="bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                >
                  Commencer l’essai gratuit
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 py-4 px-6">
          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-lg py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link href="/history" className="text-lg py-2" onClick={() => setIsOpen(false)}>Historique</Link>
                <Link href="/generate" className="text-lg py-2" onClick={() => setIsOpen(false)}>Générer</Link>
                <Link href="/profile" className="text-lg py-2 text-violet-400" onClick={() => setIsOpen(false)}>
                  {user.displayName || user.email?.split("@")[0] || "Profil"}
                </Link>
                <button onClick={handleLogout} className="text-left text-red-400 text-lg py-2">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-lg py-2" onClick={() => setIsOpen(false)}>Se connecter</Link>
                <Link href="/register" className="bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl text-center font-semibold" onClick={() => setIsOpen(false)}>
                  Commencer l’essai gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}