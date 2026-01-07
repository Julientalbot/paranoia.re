import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Paranoia — ChatGPT en entreprise, sans fuite de données",
  description:
    "Paranoia détecte et protège les données sensibles dans vos prompts avant d'interroger les LLM américains. Extension + proxy + console admin, traitement local-only.",
  icons: {
    icon: "/logo_paranoia.png",
    shortcut: "/logo_paranoia.png"
  },
  alternates: {
    canonical: "https://paranoia.re"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
        <div className="app-shell">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
