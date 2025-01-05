import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H5N1 Risk Dashboard",
  description:
    "Real-time monitoring of avian influenza trends and risk assessment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CSPostHogProvider>{children}</CSPostHogProvider>
      </body>
    </html>
  );
}
