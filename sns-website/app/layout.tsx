import type { Metadata } from "next";
import { Inter, Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "S.N.S — Care. Shine. Defend.",
    template: "%s | S.N.S Car Care",
  },
  description:
    "Premium car wash, detailing, ceramic coating, PPF, and window tinting in Alexandria, Egypt. Browse services, see transparent pricing, and book online.",
  keywords: [
    "car wash Alexandria",
    "PPF Egypt",
    "ceramic coating",
    "detailing",
    "paint protection film",
    "window tinting",
    "S.N.S",
    "Swillnspin",
    "غسيل سيارات",
    "حماية طلاء",
  ],
  openGraph: {
    title: "S.N.S — Care. Shine. Defend.",
    description:
      "Premium car care & paint protection in Alexandria. Book online, see transparent pricing for your vehicle.",
    type: "website",
    locale: "en_EG",
    siteName: "S.N.S Car Care",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${ibmPlexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <LoadingScreen />
          <Navbar />
          <main className="flex-1">{children}</main>
          <WhatsAppButton />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
