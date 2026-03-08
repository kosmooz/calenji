import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Calenji — Planifiez et Publiez sur tous vos Réseaux Sociaux",
  description: "Le calendrier social pour les créateurs et les équipes. Planifiez, programmez et publiez sur Instagram, TikTok, LinkedIn, X et Facebook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link href="/fonts/inter.css" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
