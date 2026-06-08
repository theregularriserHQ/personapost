import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "PersonaPost",
  description: "Génère tes posts LinkedIn premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-black text-white antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
