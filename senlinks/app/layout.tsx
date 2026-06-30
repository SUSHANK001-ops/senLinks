import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SenLinks — Your Link in Bio, Simplified",
  description:
    "Create your free SenLinks profile and share all your important links in one place. Click analytics, scheduled links, and more.",
  metadataBase: new URL("https://senlinks.sushanka.com.np"),
  openGraph: {
    title: "SenLinks — Your Link in Bio, Simplified",
    description: "Create your free link-in-bio page with SenLinks.",
    type: "website",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111827] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

