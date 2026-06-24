import type { Metadata } from "next";
import { Archivo, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Kirtan Samji — Mechatronics & Robotics Engineer",
  description:
    "Portfolio of Kirtan Samji — Mechatronics & Robotics Systems engineer specialising in intelligent automation, embedded control, and AI-driven systems.",
  keywords: ["mechatronics", "robotics", "embedded systems", "automation", "engineer", "portfolio"],
  authors: [{ name: "Kirtan Samji" }],
  openGraph: {
    title: "Kirtan Samji — Mechatronics & Robotics Engineer",
    description: "Designing intelligent electromechanical systems at the intersection of robotics, embedded control, and AI-driven automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${archivo.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-canvas text-frost antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
