import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { SmoothExperience } from "@/components/SmoothExperience";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "Дом на Южной",
  title: { default: "Дом на Южной — аренда дома в Борисове", template: "%s | Дом на Южной" },
  description: "Современный двухэтажный дом в Борисове для отдыха до 10 гостей: четыре спальни, оборудованная кухня, терраса и горячая купель Фурако.",
  keywords: ["дом в аренду Борисов", "Дом на Южной", "дом с купелью", "Фурако Борисов", "дом для отдыха Беларусь"],
  creator: "Дом на Южной",
  publisher: "Дом на Южной",
  category: "Аренда дома для отдыха",
  icons: {
    icon: [
      { url: "/assets/favicon.ico", sizes: "any" },
      { url: "/assets/favicon.png", type: "image/png", sizes: "256x256" }
    ],
    apple: [{ url: "/assets/apple-icon.png", type: "image/png", sizes: "180x180" }]
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Дом на Южной — аренда дома в Борисове",
    description: "Уютный двухэтажный дом с террасой и горячей купелью Фурако для отдыха до 10 гостей.",
    locale: "ru_RU",
    siteName: "Дом на Южной",
    type: "website",
    images: [{ url: "/assets/logo-og.png", width: 1200, height: 630, alt: "Логотип Дома на Южной" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Дом на Южной — аренда дома в Борисове",
    description: "Дом с террасой и горячей купелью Фурако для отдыха до 10 гостей.",
    images: ["/assets/logo-og.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: "Дом на Южной",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo-dark.png`,
    image: `${siteUrl}/images/album/album-03.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Южная улица, 12А",
      addressLocality: "Борисов",
      addressRegion: "Минская область",
      addressCountry: "BY"
    },
    telephone: "+375296479387"
  };

  return (
    <html lang="ru">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <SmoothExperience />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
