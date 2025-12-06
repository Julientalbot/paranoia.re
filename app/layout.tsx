import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"]
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
      <body className={`${sora.variable} ${manrope.variable}`}>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
