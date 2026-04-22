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
  title: "Voroxia — Auditoría de chatbots IA | Cumplimiento EU AI Act",
  description:
    "Voroxia analiza tu chatbot de IA en 82 dimensiones: lingüística, seguridad, guardrails y cumplimiento EU AI Act. Informe completo + dossier legal en minutos.",
  keywords: ["auditoría chatbot IA", "EU AI Act", "compliance IA", "seguridad chatbot", "Voroxia"],
  authors: [{ name: "Voroxia" }],
  metadataBase: new URL("https://voroxia.com"),
  openGraph: {
    title: "Voroxia — Auditoría de chatbots IA",
    description:
      "Tu chatbot de IA ya es legal o ya es un riesgo. Descúbrelo en minutos con Voroxia.",
    url: "https://voroxia.com",
    siteName: "Voroxia",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voroxia — Auditoría de chatbots IA",
    description: "82 preguntas. 6 dimensiones. Score legal + dossier EU AI Act.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
