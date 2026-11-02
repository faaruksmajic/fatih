import type { Metadata } from "next";
import { Figtree, Oswald } from "next/font/google";
import "./globals.css";

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "500"],
});

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Fatih Škrijelj — Architecture & Interior Design",
  description:
    "Portfolio of Fatih Škrijelj, architecture student and former architectural technician from Sarajevo: architecture, interior design and 3D visualization.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
