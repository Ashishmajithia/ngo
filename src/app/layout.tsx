import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ACT Charitable Trust | Together We Rise",
  description: "Grassroots non-profit dedicated to education, health, women empowerment, and community nutrition.",
  keywords: ["NGO", "Charity", "Trust", "Education", "Healthcare", "Women Empowerment", "Donation", "Volunteering"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="antialiased min-h-screen bg-[#fffdf8] text-[#183a35]">
        {children}
      </body>
    </html>
  );
}
