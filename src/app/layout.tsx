import type { Metadata } from "next";
import { Geist, Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-telugu",
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZPHS Kunaparajuparva | AP School Digital Platform",
  description:
    "Zilla Parishad High School, Kunaparajuparva — bilingual (English/Telugu) school digital platform with public website and role-specific portals.",
  keywords: ["ZPHS", "Kunaparajuparva", "Andhra Pradesh", "School", "SSC", "Education"],
  authors: [{ name: "ZPHS Kunaparajuparva" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${notoTelugu.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
