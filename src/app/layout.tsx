import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const museoSans = localFont({
  src: [
    {
      path: "../fonts/museo-sans/MuseoSans_500.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/museo-sans/MuseoSans_700.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/museo-sans/MuseoSans_900.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-museo-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAPVETS Ordering System",
  description: "Ordering System for CAPVETS products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${museoSans.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
