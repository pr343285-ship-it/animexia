import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const display = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ANIMEXIA — Anime updates, premieres & culture",
  description: "ANIMEXIA covers anime news, upcoming releases, standout series, and the stories shaping the next wave of the season.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${sans.variable} ${display.variable}`}><body>{children}</body></html>;
}
