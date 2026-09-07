import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from "@/lib/i18n-context";
import { TabBar } from "./TabBar";
import "./globals.css";

/* Self-hosted by next/font/google, but registered under the same family
   names tokens.css already expects (--f-display / --f-ui), so nothing
   else needs to change to pick them up. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://habesha-online.com"),
  title: "HabeshaOnline",
  description:
    "A community marketplace for the Ethiopian and Eritrean community in Colorado.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>
        <LanguageProvider>
          {children}
          <TabBar />
        </LanguageProvider>
        {/* Cookieless — no consent banner needed. Both are no-ops until
            enabled in the Vercel dashboard (Analytics / Speed Insights tabs). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
