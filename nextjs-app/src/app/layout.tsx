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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Classification Tarifaire CEDEAO",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Classification Tarifaire CEDEAO",
    description: "Système d'IA pour la classification tarifaire automatique",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CEDEAO TEC" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
