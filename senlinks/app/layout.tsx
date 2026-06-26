import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SenLinks — Your Link in Bio Platform",
  description:
    "SenLinks lets you create a beautiful, shareable profile page with all your important links in one place. Sign up for free.",
  metadataBase: new URL("https://senlinks.sushanka.com.np"),
  openGraph: {
    title: "SenLinks — Your Link in Bio Platform",
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
    <html lang="en" className={inter.className}>
      <body className="min-h-full flex flex-col bg-white text-[#111827] antialiased">
        {children}
      </body>
    </html>
  );
}
