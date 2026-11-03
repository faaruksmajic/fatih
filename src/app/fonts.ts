import { Righteous, Source_Code_Pro } from "next/font/google";

export const display = Righteous({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal"],
});

export const sans = Source_Code_Pro({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal"],
});
