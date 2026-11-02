import type { Metadata } from "next";
import { Righteous, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const display = Righteous({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal"],
});

const sans = Source_Code_Pro({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal"],
});

const OG_IMAGE = "https://fatih-gray.vercel.app/images/logo.png";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/logo.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  title: "Fatih Škrijelj — Architecture & Interior Design",
  description:
    "Portfolio of Fatih Škrijelj, architecture student and former architectural technician from Sarajevo: architecture, interior design and 3D visualization.",
  openGraph: {
    title: "Fatih Škrijelj — Architecture & Interior Design",
    description:
      "Portfolio of Fatih Škrijelj, architecture student and former architectural technician from Sarajevo: architecture, interior design and 3D visualization.",
    url: "https://fatih-gray.vercel.app",
    siteName: "Fatih Škrijelj",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 1200,
        alt: "Fatih Škrijelj",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fatih Škrijelj — Architecture & Interior Design",
    description:
      "Portfolio of Fatih Škrijelj, architecture student and former architectural technician from Sarajevo.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}