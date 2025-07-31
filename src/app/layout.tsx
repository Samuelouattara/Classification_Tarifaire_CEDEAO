import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Classification Tarifaire CEDEAO - TEC SH 2022",
  description: "Système d'intelligence artificielle pour la classification automatique des produits selon le Tarif Extérieur Commun CEDEAO",
  keywords: ["CEDEAO", "classification tarifaire", "TEC", "douane", "import", "export", "intelligence artificielle"],
  authors: [{ name: "CEDEAO Classification System" }],
  creator: "CEDEAO",
  publisher: "CEDEAO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Classification Tarifaire CEDEAO",
    description: "Système d'IA pour la classification tarifaire automatique",
    url: "https://classification-cedeao.vercel.app",
    siteName: "Classification Tarifaire CEDEAO",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Classification Tarifaire CEDEAO",
    description: "Système d'IA pour la classification tarifaire automatique",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://classification-cedeao.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
