import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { LivingField } from "@/components/background/living-field";
import "./globals.css";

// Swap the fonts here in one place if you want a different look.
const latin = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-deva", display: "swap" });

export const metadata: Metadata = {
  title: "KrishiSetu | Know Your Benefits",
  description: "Agricultural policy, loan and subsidy transparency platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${latin.variable} ${deva.variable}`}>
      <body>
        <LivingField />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
