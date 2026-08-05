import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sihagi-ayenya.vercel.app";

export const metadata: Metadata = {
  title: siteConfig.eventTitle,
  description: `You're invited! ${siteConfig.party.dateDisplay} at ${siteConfig.party.venueName}.`,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteConfig.eventTitle,
    description: `You're invited! ${siteConfig.party.dateDisplay} at ${siteConfig.party.venueName}.`,
    url: siteUrl,
    siteName: siteConfig.eventTitle,
    images: [
      {
        url: "/photos/11 months.jpeg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.babyName} — First Birthday Invitation`,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.eventTitle,
    description: `You're invited! ${siteConfig.party.dateDisplay} at ${siteConfig.party.venueName}.`,
    images: ["/photos/11 months.jpeg"],
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-icon.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
