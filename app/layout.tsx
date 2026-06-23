import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Hunter — Lead Generation & Outreach",
  description: "Find businesses that need websites, score their online presence, and send personalized outreach.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
