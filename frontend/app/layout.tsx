import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Full-Stack Starter",
  description: "Next.js and FastAPI development starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}