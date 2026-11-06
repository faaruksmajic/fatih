import { Archivo, Source_Code_Pro } from "next/font/google";

/**
 * Archivo carries the whole voice: expanded for headings (font-stretch: 125%),
 * normal width for reading text. The width axis is what makes that possible.
 */
export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  style: ["normal"],
});

/** Monospace is kept for annotations only: labels, numbers, buttons — the "dimensions" of the drawing. */
export const mono = Source_Code_Pro({
  variable: "--font-mono-face",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal"],
});

export const fontVariables = `${archivo.variable} ${mono.variable}`;
