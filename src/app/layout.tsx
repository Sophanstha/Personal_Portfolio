import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { InlineScript } from "@/components/motion/InlineScript";
import { bootScript } from "@/components/motion/bootScript";
import { TransitionProvider } from "@/components/layout/PageTransition";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/layout/Cursor";
import { Intro } from "@/components/layout/Intro";
import { site } from "@/content/site";
import "./globals.css";

// Variable Archivo with the width axis: every stretch effect animates 'wdth' + 'wght'
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: `${site.firstName} ${site.lastName} | ${site.role}`,
  description: site.intro,
};

export const viewport: Viewport = {
  themeColor: "#111010",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <head>
        <InlineScript html={bootScript} />
      </head>
      <body>
        <MotionProvider>
          <TransitionProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </TransitionProvider>
          <Intro />
          <Cursor />
        </MotionProvider>
      </body>
    </html>
  );
}
