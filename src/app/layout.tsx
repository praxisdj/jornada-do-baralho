import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jovem Nerd - Jornada do Baralho",
  description:
    "Gerencie sua coleção de cartas do Jovem Nerd e acompanhe assinaturas",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Jovem Nerd - Jornada do Baralho",
    description:
      "Gerencie sua coleção de cartas do Jovem Nerd e acompanhe assinaturas",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Jovem Nerd - Jornada do Baralho",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jovem Nerd - Jornada do Baralho",
    description:
      "Gerencie sua coleção de cartas do Jovem Nerd e acompanhe assinaturas",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`font-sans antialiased`}
        style={
          {
            "--font-inter": inter.variable,
            "--font-jetbrains-mono": jetbrainsMono.variable,
          } as React.CSSProperties
        }
      >
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
